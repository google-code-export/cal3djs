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
	@class CalAnimation
*/
Cal3D.CalAnimation = function(coreAnimation) {
	this.m_coreAnimation = coreAnimation;
	this.m_lastCallbackTimes = [];
	this.m_type = Cal3D.CalAnimation.Type.TYPE_NONE;
	this.m_state = Cal3D.CalAnimation.State.STATE_NONE;
	this.m_time = 0;
	this.m_timeFactor = 1;
	this.m_weight = 0;

	// build up the last called list
	var callbackList = coreAnimation.getCallbackList();
	for(var i=0; i<callbackList.length; i++) {
		this.m_lastCallbackTimes.push(0);
	}
};

/**
	The animation type enumerations.
*/
Cal3D.CalAnimation.Type = {
	TYPE_NONE:		0, 
	TYPE_CYCLE:		1, 
	TYPE_POSE:		2, 
	TYPE_ACTION:	3
};

/**
	The animation state enumerations.
*/
Cal3D.CalAnimation.State = {
	STATE_NONE:		0, 
	STATE_SYNC:		1, 
	STATE_ASYNC:	2, 
	STATE_IN:		3, 
	STATE_STEADY:	4, 
	STATE_OUT:		5, 
	STATE_STOPPED:	6
};

/**
	Get the core animation.<br />
	This function returns the core animation on which this animation instance is based on.
	@returns {Cal3D.CalCoreAnimation} the core animation.
*/
Cal3D.CalAnimation.prototype.getCoreAnimation = function() {
	return this.m_coreAnimation;
};

/**
	Get animation state.<br />
	This function returns the state of the animation instance.
	@returns {number} animation state. The return value should be one of following state:
		<li><b>Cal3D.CalAnimation.State.STATE_NONE</b></li>
		<li><b>Cal3D.CalAnimation.State.STATE_SYNC</b></li>
		<li><b>Cal3D.CalAnimation.State.STATE_ASYNC</b></li>
		<li><b>Cal3D.CalAnimation.State.STATE_IN</b></li>
		<li><b>Cal3D.CalAnimation.State.STATE_STEADY</b></li>
		<li><b>Cal3D.CalAnimation.State.STATE_OUT</b></li>
		<li><b>Cal3D.CalAnimation.State.STATE_STOPPED</b></li>
*/
Cal3D.CalAnimation.prototype.getState = function() {
	return this.m_state;
};

/**
	Get the time.<br />
	This function returns the time of the animation instance.
	@returns {number} time in seconds.
*/
Cal3D.CalAnimation.prototype.getTime = function() {
	return this.m_time;
};

/**
	Get animation type.<br />
	This function returns the type of the animation instance.
	@returns {number} animation type. The return value should be one of the following type:
		<li><b>Cal3D.CalAnimation.Type.TYPE_NONE</b></li>
		<li><b>Cal3D.CalAnimation.Type.TYPE_CYCLE</b></li>
		<li><b>Cal3D.CalAnimation.Type.TYPE_POSE</b></li>
		<li><b>Cal3D.CalAnimation.Type.TYPE_ACTION</b></li>
*/
Cal3D.CalAnimation.prototype.getType = function() {
	return this.m_type;
};

/**
	Get the weight.<br />
	This function returns the weight of the animation instance.
	@returns {number} the weight.
*/
Cal3D.CalAnimation.prototype.getWeight = function() {
	return this.m_weight;
};

/**
	Set the time.<br />
	This function set the time of the animation instance.
	@param {number} time time in seconds.
*/
Cal3D.CalAnimation.prototype.setTime = function(time) {
	this.m_time = time;
};

/**
	Set the time factor.<br />
	This function sets the time factor of the animation instance. The time factor affect only sync animation
	@param {number} timeFactor time factor.
*/
Cal3D.CalAnimation.prototype.setTimeFactor = function(timeFactor) {
	this.m_timeFactor = timeFactor;
};

/**
	Get the time factor.<br />
	This function return the time factor of the animation instance.
	@returns {number} the time factor.
*/
Cal3D.CalAnimation.prototype.getTimeFactor = function() {
	return this.m_timeFactor;
};

/**
	@private
*/
Cal3D.CalAnimation.prototype.checkCallbacks = function(animationTime, model) {
	var callbackList = this.m_coreAnimation.getCallbackList();
	for (var i=0; i<callbackList.length; i++) {
		// support for dynamic adding of callbacks
		if (this.m_lastCallbackTimes.length <= i)
			this.m_lastCallbackTimes.push(animationTime);

		callbackList[i].callback.AnimationUpdate(animationTime, model, model.getUserData());
		if (animationTime > 0 && animationTime < this.m_lastCallbackTimes[i])		// looped
			this.m_lastCallbackTimes[i] -= this.m_coreAnimation.getDuration();
		else if (animationTime < 0 && animationTime > this.m_lastCallbackTimes[i])	// reverse-looped  
			this.m_lastCallbackTimes[i] += this.m_coreAnimation.getDuration();

		if ( (animationTime >= 0 && animationTime >= this.m_lastCallbackTimes[i] + callbackList[i].min_interval) ||
			 (animationTime <  0 && animationTime <= this.m_lastCallbackTimes[i] - callbackList[i].min_interval) ) {
			callbackList[i].callback.AnimationUpdate(animationTime, model, model.getUserData());
			this.m_lastCallbackTimes[i] = animationTime;
		}
	}
};

/**
	@private
*/
Cal3D.CalAnimation.prototype.completeCallbacks = function(model) {
	var callbackList = this.m_coreAnimation.getCallbackList();
	for(var i=0; i<callbackList.length; i++) {
		callbackList[i].callback.AnimationComplete(model, model.getUserData());
	}
};

/**
	@private
*/
Cal3D.CalAnimation.prototype.setType = function(type) {
	this.m_type = type;
};

/**
	@private
*/
Cal3D.CalAnimation.prototype.setState = function(state) {
	this.m_state = state;
};

/**
	@private
*/
Cal3D.CalAnimation.prototype.setWeight = function(weight) {
	this.m_weight = weight;
};



/**
	@class CalAnimationCallback

	The animation call-back interface.
*/
Cal3D.CalAnimationCallback = function() {
};

Cal3D.CalAnimationCallback.prototype.AnimationUpdate = function(anim_time, model, userData) {
};

Cal3D.CalAnimationCallback.prototype.AnimationComplete = function(model, userData) {
};



/**
	@class CalAnimationAction
*/
Cal3D.CalAnimationAction = function(coreAnimation) {
	// call constructor of super class
	Cal3D.CalAnimation.call(this, coreAnimation);

	this.m_delayIn = 0;
	this.m_delayOut = 0;
	this.m_delayTarget = 0;
	this.m_weightTarget = 0;
	this.m_autoLock = false;

	this.setType(Cal3D.CalAnimation.Type.TYPE_ACTION);
};

// inherited from CalAnimation
Cal3D.CalAnimationAction.prototype = new Cal3D.CalAnimation(new Cal3D.CalCoreAnimation /* dummy object */);

/**
	Execute the animation action instance.<br />
	This function executes the animation action instance.
	@param {number} delayIn The time in seconds until the animation action instance reaches the full weight from the beginning of its execution.
	@param {number} delayOut The time in seconds in which the animation action instance reaches zero weight at the end of its execution.
	@param {number} weightTarget Target weight.
	@param {boolean} autoLock If set to true, the animation will not be reset and removed on the last keyframe.
*/
Cal3D.CalAnimationAction.prototype.execute = function(delayIn, delayOut, weightTarget, autoLock) {
	if(weightTarget == undefined)
		weightTarget = 1;
	if(autoLock == undefined)
		autoLock = false;

	this.setState(Cal3D.CalAnimation.State.STATE_IN);
	this.setWeight(0);
	this.m_delayIn = delayIn;
	this.m_delayOut = delayOut;
	this.setTime(0);
	this.m_weightTarget = weightTarget;
	this.m_autoLock = autoLock;

	return true;
};

/**
	Update the animation action instance.<br />
	This function updates the animation action instance for a given amount of time.
	@param {number} deltaTime The elapsed time in seconds since the last update.
	@returns {boolean} Whether or not the end the the action has been reached. 
		<li>true, if the animation action instance is still active;</li>
		<li>false, if the execution of the animation action instance has ended.</li>
*/
Cal3D.CalAnimationAction.prototype.update = function(deltaTime) {
	// update animation action time
	if(this.getState() != Cal3D.CalAnimation.State.STATE_STOPPED) {
		this.setTime(this.getTime() + deltaTime * this.getTimeFactor());
	}

	// handle IN phase
	if(this.getState() == Cal3D.CalAnimation.State.STATE_IN) {
		// check if we are still in the IN phase
		if(this.getTime() < this.m_delayIn) {
			this.setWeight(this.getTime() / this.m_delayIn * this.m_weightTarget);
		}
		else {
			this.setState(Cal3D.CalAnimation.State.STATE_STEADY);
			this.setWeight(this.m_weightTarget);
		}
	}

	// handle STEADY
	if(this.getState() == Cal3D.CalAnimation.State.STATE_STEADY) {
		// check if we reached OUT phase
		if(!this.m_autoLock && this.getTime() >= this.getCoreAnimation().getDuration() - this.m_delayOut) {
			this.setState(Cal3D.CalAnimation.State.STATE_OUT);
		}
		// if the anim is supposed to stay locked on last keyframe, reset the time here.
		else if(this.m_autoLock && this.getTime() > this.getCoreAnimation().getDuration()) {
			this.setState(Cal3D.CalAnimation.State.STATE_STOPPED);
			this.setTime(this.getCoreAnimation().getDuration());
		}      
	}

	// handle OUT phase
	if(this.getState() == Cal3D.CalAnimation.State.STATE_OUT) {
		// check if we are still in the OUT phase
		if(this.getTime() < this.getCoreAnimation().getDuration()) {
			this.setWeight((this.getCoreAnimation().getDuration() - this.getTime()) / this.m_delayOut * this.m_weightTarget);
		}
		else {
			// we reached the end of the action animation
			this.setWeight(0);
			return false;
		}
	}

	return true;
};



/**
	@class CalAnimationCycle
*/
Cal3D.CalAnimationCycle = function(coreAnimation) {
	// call constructor of super class
	Cal3D.CalAnimation.call(this, coreAnimation);

	this.m_targetDelay = 0;
	this.m_targetWeight = 0;

	this.setType(Cal3D.CalAnimation.Type.TYPE_CYCLE);
	this.setState(Cal3D.CalAnimation.State.STATE_SYNC);

	this.setWeight(0);
};

// inherited from CalAnimation
Cal3D.CalAnimationCycle.prototype = new Cal3D.CalAnimation(new Cal3D.CalCoreAnimation /* dummy object */);

/**
	Interpolate the weight of the animation cycle instance.<br />
	This function interpolates the weight of the animation cycle instance to a new value in a given amount of time.
	@param {number} weight The weight to interpolate the animation cycle instance to. 
	@param {number} delay The time in seconds until the new weight should be reached. 
	@returns {boolean} false if error happeded.
*/
Cal3D.CalAnimationCycle.prototype.blend = function(weight, delay) {
  this.m_targetWeight = weight;
  this.m_targetDelay = delay;

  return true;
};

/**
	Put the animation cycle instance into async state.<br />
	This function puts the animation cycle instance into async state, which means that it will end after the current running cycle.
	@param {number} time The time in seconds at which the animation cycle instance was unlinked from the global mixer animation cycle.
	@param {number} duration The current duration of the global mixer animation cycle in seconds at the time of the unlinking. 
*/
Cal3D.CalAnimationCycle.prototype.setAsync = function(time, duration) {
	// check if thie animation cycle is already async
	if(this.getState() != Cal3D.CalAnimation.State.STATE_ASYNC) {
		if(duration == 0) {
			this.setTimeFactor(1);
			this.setTime(0);
		}
		else {
			this.setTimeFactor(this.getCoreAnimation().getDuration() / duration);
			this.setTime(time * this.getTimeFactor());
		}

		this.setState(Cal3D.CalAnimation.State.STATE_ASYNC);
	}
};

/**
	Update the animation cycle instance.<br />
	This function updates the animation cycle instance for a given amount of time.
	@param {number} deltaTime The elapsed time in seconds since the last update.
	@returns {boolean} Whether or not the animation cycle has ended.
		<li>true if the animation cycle instance is still active.</li>
		<li>false if the execution of the animation cycle instance has ended.</li>
*/
Cal3D.CalAnimationCycle.prototype.update = function(deltaTime) {
	if(this.m_targetDelay <= Math.abs(deltaTime)) {
		// we reached target delay, set to full weight
		this.setWeight(this.m_targetWeight);
		this.m_targetDelay = 0;

		// check if we reached the cycles end
		if(this.getWeight() == 0) {
			return false;
		}
	}
	else {
		// not reached target delay yet, interpolate between current and target weight
		var factor = deltaTime / this.m_targetDelay;
		this.setWeight((1 - factor) * this.getWeight() + factor * this.m_targetWeight);
		this.m_targetDelay -= deltaTime;
	}

	// update animation cycle time if it is in async state
	if(this.getState() == Cal3D.CalAnimation.State.STATE_ASYNC) {
		this.setTime(this.getTime() + deltaTime * this.getTimeFactor());
		if(this.getTime() >= this.getCoreAnimation().getDuration()) {
			this.setTime(this.getTime() % this.getCoreAnimation().getDuration());
		}
		if (this.getTime() < 0) {
			this.setTime(this.getTime() + this.getCoreAnimation().getDuration());
		}
	}

	return true;
};
