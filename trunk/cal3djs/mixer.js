/*****************************************************************************
* Cal3D 3d character animation library
* Copyright (C) 2001, 2002 Bruno 'Beosil' Heidelberger
*
* This library is free software; you can redistribute it and/or modify it
* under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation; either version 2.1 of the License, or (at
* your option) any later version.
*****************************************************************************/

/*****************************************************************************
* Cal3DJS Javascript port of Cal3D for WebGL and canvas applications
* by Humu humu2009@gmail.com
* http://code.google.com/p/cal3djs/
*****************************************************************************/


var Cal3D = Cal3D || {};



/**
	@class CalAbstractMixer

	CalAbstractMixer defines the API that CalModel relies on for blending and scheduling animations.<br />
	A third party mixer must implement this API in order to register itself with the CalModel.setAbstractMixer method. 
	The default mixer (CalMixer) is an example of such implementation.<br /><br />

	Cal3D expects a mixer to handle two tasks: scheduling and blending. Scheduling refers to everything related to time such 
	as when an animation must run or when it must stop. Blending defines how concurrent animations influence each other: for 
	instance walking and waving.<br /><br />

	If CalMixer proves to be insufficient for the applications needs, an alternate mixer can be implemented and used without 
	notifying Cal3D in any way. It is not mandatory to subclass CalAbstractMixer. However, when chosing this path, one must 
	also avoid using the CalModel.update method because it would use the default mixer instantiated by the CalModel.create method 
	with undesirable side effects. In addition libraries based on Cal3D (think NebulaDevice or OpenSceneGraph adapters) are 
	not aware of these constraints and will keep calling the CalModel.update method of CalModel regardless.<br /><br />

	Subclassing CalAbstractMixer when implementing an alternate mixer therefore provides a better integration with Cal3D and 
	libraries that rely on CalModel. However, an additional effort is required in order to achieve compatibility with libraries or 
	applications that rely on the CalMixer API (i.e. that use methods such as blendCycle or executeAction).  The CalMixer API is not 
	meant to be generic and there is no reason to define an abstract class that specifies it. For historical reasons and because 
	CalMixer is the default mixer, some applications and libraries (think Soya or CrystalSpace) depend on it. If they want to switch 
	to a scheduler with extended capabilities it might be painfull for them to learn a completely different API. A scheduler with the 
	ambition to obsolete CalMixer should therefore provide an API compatible with it to ease the migration process.<br /><br />

	Short summary, if you want to write a new mixer:<br /><br />

	1) An external mixer: ignore CalAbstractMixer and implement a mixer of your own. Avoid calling CalModel.update and any library or 
	application that will call it behind your back. Avoid libraries and applications that rely on the default mixer CalMixer, as returned 
	by CalModel.getMixer.<br /><br />

	2) A mixer registered in Cal3D: subclass CalAbstractMixer, register it with CalModel.setAbstractMixer.  Avoid libraries and 
	applications that rely on the default mixer CalMixer, as returned by CalModel.getMixer. CalModel.getMixer will return a null 
	pointer if CalModel.setAbstractMixer was called to set a mixer that is not an instance of CalMixer.<br /><br />

	3) A CalMixer replacement: same as 2) and provide a subclass of your own mixer that implements the CalMixer API so that existing 
	applications can switch to it by calling CalModel.getAbstractMixer instead of CalModel.getMixer. The existing code using the CalMixer 
	methods will keep working and the developper will be able to switch to a new API when convenient.
*/
Cal3D.CalAbstractMixer = function() {
};

/**
	See if the object is an instance of the default mixer (i.e. Cal3D.CalMixer).<br />
	@returns {boolean} true, if the object is an instance of Cal3D.CalMixer; false if not.
*/
Cal3D.CalAbstractMixer.prototype.isDefaultMixer = function() {
	return false;
};

/**
	Notify the instance that updateAnimation was last called eltaTime seconds ago. The internal scheduler of the instance 
	should terminate animations or update the timing information of active animations accordingly. It should not blend animations 
	together or otherwise modify the CalModel associated to these animations.<br />br />
	
	The CalModel.update method will call updateSkeleton immediately after updateAnimation if the instance was allocated by 
	CalModel.create (in which case it is a CalMixer instance) or if the instance was set via CalModel.setAbstractMixer.

	@param {number} deltaTime The elapsed time in seconds since the last call.
*/
Cal3D.CalAbstractMixer.prototype.updateAnimation = function(deltaTime) {
	throw 'abstract method error';
};

/**
	Update the skeleton of the corresponding CalModel (as provided to the create method) to match the current animation state (as 
	updated by the last call to updateAnimation).  The tracks of each active animation are blended to compute the position and 
	orientation of each bone of the skeleton. The updateAnimation method should be called just before calling updateSkeleton to 
	define the set of active animations.<br /><br />

	The CalModel.update method will call updateSkeleton immediately after updateAnimation if the instance was allocated by 
	CalModel.create (in which case it is a CalMixer instance) or if the instance was set via CalModel.setAbstractMixer.
*/
Cal3D.CalAbstractMixer.prototype.updateSkeleton = function() {
	throw 'abstract method error';
};



/**
	@class CalMixer
*/
Cal3D.CalMixer = function(model) {
	this.m_model = model;
	this.m_vectorAnimation = new Array(model.getCoreModel().getCoreAnimationCount());
	this.m_listAnimationAction = [];
	this.m_listAnimationCycle = [];
	this.m_animationTime = 0;
	this.m_animationDuration = 0;
	this.m_timeFactor = 1;
};

// inherited from CalAbstractMixer
Cal3D.CalMixer.prototype = new Cal3D.CalAbstractMixer;

/**
	See if the object is an instance of Cal3D.CalMixer.<br />
	@returns {boolean} Always return true. 
*/
Cal3D.CalMixer.prototype.isDefaultMixer = function() {
	return true;
};

/**
	Interpolate the weight of an animation cycle.<br />
	This function interpolates the weight of an animation cycle to a new value in a given amount of time. If the specified 
	animation cycle is not active yet, it is activated.
	@param {number} id The ID of the animation cycle to be blended.
	@param {number} weight The weight to interpolate the animation cycle to.
	@param {number} delay The time in seconds until the new weight should be reached.
	@returns {boolean} true if succeeded; false if any error happened.
*/
Cal3D.CalMixer.prototype.blendCycle = function(id, weight, delay) {
	if(id < 0 || id >= this.m_vectorAnimation.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'mixer.js');
		return false;
	}

	// get the animation for the given id
	var animation = this.m_vectorAnimation[id];

	// create a new animation instance if it is not active yet
	if(!animation) {
		// take the fast way out if we are trying to clear an inactive animation
		if(weight == 0) 
			return true;

		// get the core animation
		var coreAnimation = this.m_model.getCoreModel().getCoreAnimation(id);
		if(!coreAnimation) 
			return false;

		// ensure that the animation's first and last key frame match for proper looping
		Cal3D.addExtraKeyframeForLoopedAnim(coreAnimation);

		// create a new animation cycle instance
		var animationCycle = new Cal3D.CalAnimationCycle(coreAnimation);

		// insert the new animation into the tables
		this.m_vectorAnimation[id] = animationCycle;
		this.m_listAnimationCycle.unshift(animationCycle);

		// blend the animation
		return animationCycle.blend(weight, delay);
	}

	// check if this is really an animation cycle instance
	if(animation.getType() != Cal3D.CalAnimation.Type.TYPE_CYCLE) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_ANIMATION_TYPE, 'mixer.js');
		return false;
	}

	// clear the animation cycle from the active vector if the target weight is zero
	if(weight == 0) {
		this.m_vectorAnimation[id] = null;
	}

	// cast it to an animation cycle
	var animationCycle = animation;

	// blend the animation cycle
	animationCycle.blend(weight, delay);
	animationCycle.checkCallbacks(0, this.m_model);

	return true;
};

/**
	Fade an animation cycle out.<br />
	This function fades an animation cycle out in a given amount of time.
	@param {number} id The ID of the animation cycle to be faded out.
	@param {number} delay The time in seconds until the the animation cycle is completely removed.
	@returns {boolean} true if succeeded; false if any error happened.
*/
Cal3D.CalMixer.prototype.clearCycle = function(id, delay) {
	// check if the animation id is valid
	if(id < 0 || id >= this.m_vectorAnimation.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'mixer.js');
		return false;
	}

	// get the animation for the given id
	var animation = this.m_vectorAnimation[id];

	// we can only clear cycles that are active
	if(!animation) 
		return true;

	// check if this is really a animation cycle instance
	if(animation.getType() != Cal3D.CalAnimation.Type.TYPE_CYCLE) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_ANIMATION_TYPE, 'mixer.js');
		return false;
	}

	// clear the animation cycle from the active vector
	this.m_vectorAnimation[id] = null;

	// cast it to an animation cycle
	var animationCycle = animation;

	// set animation cycle to async state
	animationCycle.setAsync(this.m_animationTime, this.m_animationDuration);

	// blend the animation cycle
	animationCycle.blend(0, delay);
	animationCycle.checkCallbacks(0, this.m_model);

	return true;
};

/**
	Execute an animation action.<br />
	This function executes an animation action.
	@param {number} id The ID of the animation action to be execute.
	@param {number} delayIn  The time in seconds until the animation action reaches the full weight from the beginning of its execution.
	@param {number} delayOut The time in seconds in which the animation action reaches zero weight at the end of its execution.
	@param {number} weightTarget The weight to interpolate the animation action to.
	@param {boolean} autoLock This prevents the action from being reset and removed on the last keyframe if true.
	@returns {boolean} true if succeeded; false if any error happened.
*/
Cal3D.CalMixer.prototype.executeAction = function(id, delayIn, delayOut, weightTarget, autoLock) {
	// get the core animation
	var coreAnimation = this.m_model.getCoreModel().getCoreAnimation(id);
	if(!coreAnimation)
		return false;

	// create a new animation action instance
	var animationAction = new Cal3D.CalAnimationAction(coreAnimation);

	// insert the new animation into the table
	this.m_listAnimationAction.unshift(animationAction);

	// execute the animation
	animationAction.execute(delayIn, delayOut, weightTarget, autoLock);
	animationAction.checkCallbacks(0, this.m_model);

	return true;
};

/**
	Clear an active animation action.<br />
	This function removes an animation action from the blend list. This is particularly useful with auto-locked actions on their last frame.
	@param {number} id The ID of the animation action to be removed.
	@returns {boolean} true if succeeded; false if the animation does not exist any error happened.
*/
Cal3D.CalMixer.prototype.removeAction = function(id) {
	// get the core animation
	var coreAnimation = this.m_model.getCoreModel().getCoreAnimation(id);
	if(!coreAnimation)
		return false;

	// update all active animation actions of this model
	var iAnimationAction = 0;
	while(iAnimationAction < this.m_listAnimationAction.length) {
		// find the specified action and remove it
		if(this.m_listAnimationAction[iAnimationAction].getCoreAnimation() == coreAnimation) {
			// found, so remove
			this.m_listAnimationAction[iAnimationAction].completeCallbacks(this.m_model);
			this.m_listAnimationAction.splice(iAnimationAction, 1);
			return true;
		}

		iAnimationAction++;
	}

	return false;
};

/**
	Update all active animations.<br />
	This function updates all active animations of the mixer instance for a given amount of time.
	@param {number} deltaTime The elapsed time in seconds since the last update.
*/
Cal3D.CalMixer.prototype.updateAnimation = function(deltaTime) {
	// update the current animation time
	if(this.m_animationDuration == 0) {
		this.m_animationTime = 0;
	}
	else {
		this.m_animationTime += deltaTime * this.m_timeFactor;
		if(this.m_animationTime >= this.m_animationDuration || this.m_animationTime < 0) {
			this.m_animationTime = this.m_animationTime % this.m_animationDuration;
		}
		if (this.m_animationTime < 0) {
			this.m_animationTime += this.m_animationDuration;
		}
	}

	// update all active animation actions of this model
	var iAnimationAction = 0;
	while(iAnimationAction < this.m_listAnimationAction.length) {
		var animationAction = this.m_listAnimationAction[iAnimationAction];
		// update and check if animation action is still active
		if(animationAction.update(deltaTime)) {
			animationAction.checkCallbacks(animationAction.getTime(), this.m_model);
			iAnimationAction++;
		}
		else {
			// animation action has ended, destroy and remove it from the animation list
			animationAction.completeCallbacks(this.m_model);
			this.m_listAnimationAction.splice(iAnimationAction, 1);
		}
	}

	// TODO: update all active animation poses of this model
	// ...

	// update the weight of all active animation cycles of this model
	var accumulatedWeight = 0;
	var accumulatedDuration = 0;
	var iAnimationCycle = 0;
	while(iAnimationCycle < this.m_listAnimationCycle.length) {
		var animationCycle = this.m_listAnimationCycle[iAnimationCycle];
		// update and check if animation cycle is still active
		if(animationCycle.update(deltaTime)) {
			// check if it is in sync. if yes, update accumulated weight and duration
			if(animationCycle.getState() == Cal3D.CalAnimation.State.STATE_SYNC) {
				accumulatedWeight += animationCycle.getWeight();
				accumulatedDuration += animationCycle.getWeight() * animationCycle.getCoreAnimation().getDuration();
			}

			animationCycle.checkCallbacks(this.m_animationTime, this.m_model);
			iAnimationCycle++;
		}
		else {
			// animation cycle has ended, destroy and remove it from the animation list
			animationCycle.completeCallbacks(this.m_model);
			this.m_listAnimationCycle.splice(iAnimationCycle, 1);
		}
	}

	// adjust the global animation cycle duration
	if(accumulatedWeight > 0) {
		this.m_animationDuration = accumulatedDuration / accumulatedWeight;
	}
	else {
		this.m_animationDuration = 0;
	}
};

/**
	Update the skeleton of the corresponding model to match the current animation state.
*/
Cal3D.CalMixer.prototype.updateSkeleton = function() {
	// get the skeleton we need to update
	var skeleton = this.m_model.getSkeleton();
	if(!skeleton) 
		return;

	// clear the skeleton state
	skeleton.clearState();

	// get the bone vector of the skeleton
	var vectorBone = skeleton.getVectorBone();

	var translation = new Cal3D.CalVector;
	var rotation = new Cal3D.CalQuaternion;

	// loop through all animation actions
	for(var iAnimationAction=0; iAnimationAction<this.m_listAnimationAction.length; iAnimationAction++) {
		var animationAction = this.m_listAnimationAction[iAnimationAction];
		
		// get the core animation instance
		var coreAnimation = animationAction.getCoreAnimation();

		// get the list of core tracks of above core animation
		var listCoreTrack = coreAnimation.getListCoreTrack();

		// loop through all core tracks of the core animation
		for(var iCoreTrack=0; iCoreTrack<listCoreTrack.length; iCoreTrack++) {
			// get the appropriate bone of the track
			var bone = vectorBone[ listCoreTrack[iCoreTrack].getCoreBoneId() ];

			// get the current translation and rotation
			listCoreTrack[iCoreTrack].getState(animationAction.getTime(), translation, rotation);

			// blend the bone state with the new state
			bone.blendState(animationAction.getWeight(), translation, rotation);
		}
	}

	// lock the skeleton state
	skeleton.lockState();

	// loop through all animation cycles
	for(var iAnimationCycle=0; iAnimationCycle<this.m_listAnimationCycle.length; iAnimationCycle++) {
		var animationCycle = this.m_listAnimationCycle[iAnimationCycle];

		// get the core animation instance
		var coreAnimation = animationCycle.getCoreAnimation();

		// calculate adjusted time
		var animationTime;
		if(animationCycle.getState() == Cal3D.CalAnimation.State.STATE_SYNC) {
			if(this.m_animationDuration == 0)
				animationTime = 0;
			else
				animationTime = this.m_animationTime * coreAnimation.getDuration() / this.m_animationDuration;
		}
		else {
			animationTime = animationCycle.getTime();
		}

		// get the list of core tracks of above core animation
		var listCoreTrack = coreAnimation.getListCoreTrack();

		// loop through all core tracks of the core animation
		for(var iCoreTrack=0; iCoreTrack<listCoreTrack.length; iCoreTrack++) {
			// get the appropriate bone of the track
			var bone = vectorBone[ listCoreTrack[iCoreTrack].getCoreBoneId() ];

			// get the current translation and rotation
			listCoreTrack[iCoreTrack].getState(animationTime, translation, rotation);

			// blend the bone state with the new state
			bone.blendState(animationCycle.getWeight(), translation, rotation);
		}
	}

	// lock the skeleton state
	skeleton.lockState();

	// let the skeleton calculate its final state
	skeleton.calculateState();
};

/**
	Get the animation time.<br />
	This function returns the animation time of the mixer instance.
	@returns {number} The animation time in seconds.
*/
Cal3D.CalMixer.prototype.getAnimationTime = function() {
	return this.m_animationTime;
};

/**
	Get the animation duration.<br />
	This function returns the animation duration of the mixer instance.
	@returns {number} The animation duration in seconds.
*/
Cal3D.CalMixer.prototype.getAnimationDuration = function() {
	return this.m_animationDuration;
};

/**
	Set the animation time.<br />
	This function sets the animation time of the mixer instance.
	@param {number} animationTime The animation time to be set.
*/
Cal3D.CalMixer.prototype.setAnimationTime = function(animationTime) {
	this.m_animationTime = animationTime;
};

/**
	Set the time factor.<br />
	This function sets the time factor of the mixer instance. This time factor affect only sync animation
	@param {number} timeFactor The time factor to be set.
*/
Cal3D.CalMixer.prototype.setTimeFactor = function(timeFactor) {
	this.m_timeFactor = timeFactor;
};

/**
	Get the time factor.<br />
	This function return the time factor of the mixer instance.
	@returns {number} The time factor.
*/
Cal3D.CalMixer.prototype.getTimeFactor = function() {
	return this.m_timeFactor;
};

/**
	Get the model.<br />
	This function return the CalModel of the mixer instance.
	@returns {Cal3D.CalModel} The model.
*/
Cal3D.CalMixer.prototype.getCalModel = function() {
	return this.m_model;
};

/**
	Get the animation list.<br />
	This function return the animation list of the mixer instance.
	@returns {Array} The animation list.
*/
Cal3D.CalMixer.prototype.getAnimationVector = function() {
	return this.m_vectorAnimation;
};

/**
	Get the list of the action animations.<br />
	This function return the list of the action animations of the mixer instance.
	@returns {Array} The list of the action animations.
*/
Cal3D.CalMixer.prototype.getAnimationActionList = function() {
	return this.m_listAnimationAction;
};

/**
	Get the list of the cycle animations.<br />
	This function return the list of the cycle animations of the mixer instance.
	@returns {Array} The list of the cycle animations.
*/
Cal3D.CalMixer.prototype.getAnimationCycle = function() {
	return this.m_listAnimationCycle;
};

/**
	Examine the given animation and if the first and last keyframe of a given track do not match up, the first key frame is duplicated 
	and added to the end of the track to ensure smooth looping.
*/
Cal3D.addExtraKeyframeForLoopedAnim = function(coreAnimation) {
	var listCoreTrack = coreAnimation.getListCoreTrack();
	if(listCoreTrack.length == 0)
		return;

	var iCoreTrack = 0;
	if(!listCoreTrack[iCoreTrack])
		return;

	var lastKeyframe = listCoreTrack[iCoreTrack].getCoreKeyframe( listCoreTrack[iCoreTrack].getCoreKeyframeCount() - 1 );
	if(!lastKeyframe)
		return;

	if(lastKeyframe.getTime() < coreAnimation.getDuration()) {
		for(iCoreTrack=0; iCoreTrack<listCoreTrack.length; iCoreTrack++) {
			var coreTrack = listCoreTrack[iCoreTrack];

			var firstKeyframe = coreTrack.getCoreKeyframe(0);
			var newKeyframe = new Cal3D.CalCoreKeyframe;

			newKeyframe.setTranslation(firstKeyframe.getTranslation());
			newKeyframe.setRotation(firstKeyframe.getRotation());
			newKeyframe.setTime(coreAnimation.getDuration());

			coreTrack.addCoreKeyframe(newKeyframe);
		}
	}
};
