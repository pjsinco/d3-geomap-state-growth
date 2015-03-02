###Sat Feb 28 07:34:16 2015 CST
* [How can I bring a circle to the front with d3?](http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3)
<p>You will have to change the order of object and make the circle you mouseover being the last element added. As you can see here: <a href="https://gist.github.com/3922684">https://gist.github.com/3922684</a> and as suggested by <a href="http://stackoverflow.com/users/760156/nautat">nautat</a>, you have to define the following before your main script: </p>

<pre><code>d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
</code></pre>

<p>Then you will just have to call the <code>moveToFront</code> function on your object (say <code>circles</code>) on mouseover: </p>

<pre><code>circles.on("mouseover",function(){
  var sel = d3.select(this);
  sel.moveToFront();
});
</code></pre>

<hr>

<p><strong>Edit:</strong>
As mentioned by <a href="http://stackoverflow.com/users/598513/clemens-tolboom">Clemens Tolboom</a>, the reverse function would be:</p>

<pre><code>d3.selection.prototype.moveToBack = function() { 
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    }); 
};
</code></pre>

* [Making a Simple Interactive Map Prototype with D3…For Total Beginners Who are Totally Impatient](https://suffenus.wordpress.com/2014/01/07/making-interactive-maps-with-d3-for-total-beginners/)

###Sun Mar  1 05:55:14 2015 CST
* [Building Responsive Visualizations with D3.js](https://blog.safaribooksonline.com/2014/02/17/building-responsible-visualizations-d3-js/)

* [Responsive Charts with D3](http://eyeseast.github.io/visible-data/2013/08/28/responsive-charts-with-d3/)

* [Responsive D3 Charting](http://www.brendansudol.com/posts/responsive-d3/)
    * This one is starred

* [Responsive Charts With D3 And Pym.js](http://blog.apps.npr.org/2014/05/19/responsive-charts.html)

###Mon Mar  2 06:00:07 2015 CST
