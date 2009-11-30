Prototype.Simulate

Description:
    Prototype based helper library for simulating mouse and keyboard events.
    This is the port of http://github.com/eduardolundgren/jquery-simulate/

Example:
         $('foo').simulate('keypress', Event.KEY_RETURN);

         Element.simulate(document, 'keypress', Event.KEY_ESC);

         $('foo').simulate("mouseover");

         $('foo').simulate('click');

         $('foo').simulate('keydown', {ctrlKey: true, keyCode: Event.KEY_END});

         $('foo').simulate('keydown', {keyCode: Event.KEY_ENTER});

         $('handle').simulate("drag", {
         	  dx: 20,
         	  dy: 20
         });

         $('foo').simulate("drag", {
         		dx: 10, dy: 0, speed: 'sync', complete: function(){alert('drug simulation completed!')}
         });


Author:
    saksmlz, saksmlz@gmail.com

