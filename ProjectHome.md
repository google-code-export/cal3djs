_Cal3DJS_ is an open source Javascript skeleton based 3D character animation engine ported from the original C/C++ _[Cal3D](http://home.gna.org/cal3d/)_ project. It is designed (but not limited) to be utilized by WebGL and canvas applications. _Cal3DJS_ is pure Javascript and independent of any graphic API.

# Features #
  * skeleton based animations
  * seamless blending of multiple animation tracks
  * attachment and detachment of one or more skinned meshes at runtime
  * transformation of vertices and normals according to the weighted influence of one or more bones
  * flexible material handling
  * support for multiple texture mapping channels
  * progressive meshes for character LOD (level-of-detail)
  * both binary and text (XML) file formats
  * experimental spring-system support for cloth and hair animation
  * exporter plugins supported (3D Studio Max, Blender, MilkShape and more)
  * highly modular design
  * free and open source under the LGPL license

# Demos and Screenshots #
|[![](http://cal3djs.googlecode.com/svn/screenshots/cally.jpg)](http://cal3djs.googlecode.com/svn/trunk/demo/cally.html)|
|:----------------------------------------------------------------------------------------------------------------------|

The _Cally_ demo is an interactive application that demonstrates some key features of the _Cal3DJS_ library, such as model loading, animation blending, runtime LOD, spring system, etc.  You should have a [WebGL](http://www.khronos.org/webgl/wiki_1_15/index.php/Getting_a_WebGL_Implementation) enabled browser to run this:<br>
<a href='http://cal3djs.googlecode.com/svn/trunk/demo/cally.html'>http://cal3djs.googlecode.com/svn/trunk/demo/cally.html</a>.<br><br>
If your browser does not support WebGL, you can still play a heavily simplified demo that runs on 2D canvas. An HTML5 compatible browser (with a high efficient Javascript runtime) is required to render the model and animations correctly (IE would not do):<br>
<a href='http://cal3djs.googlecode.com/svn/trunk/demo/canvas_demo.html'>http://cal3djs.googlecode.com/svn/trunk/demo/canvas_demo.html</a>.