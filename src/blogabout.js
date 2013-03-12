(function($) {
  if (CKEDITOR) {
    CKEDITOR.disableAutoInline = true;
  }

  $.blogabout = function(options) {
    var $container, $blogarea, $blogtab, $blogediting, $editable, $toolbar, $submit, $addBtn;
    var settings, container_height, ckeditor, resize_interval, popped;
    var popout, popin, rebuild_editor, destroy_editor;

    popped = false;

    settings = {
      placeholderText: 'Blog about "{{title}}"',
      tooltip: 'Blog about this!',
      loadingText: 'Posting...',
      completeText: 'Posted!',
      errorText: 'Unable to Post',
      postText: 'Post &raquo;',
      addButtonText: '<i class="icon-plus icon-white"></i> Add to Blog',
      show: function() {},
      hide: function() {},
      submit: function(html, success, error) {
        $.ajax({
          'url': '?',
          'method': 'POST',
          'data': html,
          'success': success,
          'error': error
        });
      }
    };

    $.extend(settings, options);

    settings.placeholderText = settings.placeholderText.replace('{{title}}', document.title);

    $editable = $('<div>')
      .attr('id', 'blog-editable')
      .append(settings.placeholderText);

    $blogtab = $('<div>')
      .attr('id', 'blog-tab')
      .append(
        $('<div>')
          .attr('id', 'blog-icon')
      );

    $blogediting = $('<div>')
      .attr('id', 'blog-editing')
      .append($editable);

    $blogarea = $('<div>')
      .attr('id', 'blog-area')
      .append($blogediting);

    $toolbar = $('<div>')
      .attr('id', 'blog-toolbar');

    $container = $('<div>')
      .attr('id', 'blogabout-container')
      .addClass('blogabout')
      .addClass('fixed')
      .append($blogarea)
      .append($blogtab)
      .appendTo('body');

    container_height = $blogarea.height();

    $blogarea.css('height', '0px');
    $blogarea.hide();
    $blogtab
      .data('open', false)
      .addClass('closed');

    $addBtn = $('<div>')
      .attr('id', 'blog-add-btn')
      .addClass('btn')
      .addClass('btn-inverse')
      .html(settings.addButtonText)
      .appendTo($('body'))
      .hide();


    $submit = $('<button>')
      .attr('id', 'blog-post-button')
      .attr('data-loading-text', settings.loadingText)
      .attr('data-complete-text', settings.completeText)
      .attr('data-error-text', settings.errorText)
      .html(settings.postText)
      .addClass('btn btn-primary')
      .click(function() {
        $(this).button('loading');
        var html = CKEDITOR.instances['blog-editable'].getData();

        settings.submit(html, 
          function() {
            $submit.button('complete').prop('disabled');
            setTimeout(function() {
              $submit.button('reset').removeProp('disabled');
              CKEDITOR.instances['blog-editable'].setData(settings.placeholderText);
              toggleBlog();
            }, 800);
          },
          function() {
            $submit.button('error');
          }
        );
      });

    $blogarea
      .prepend($submit)
      .prepend($toolbar);

    $toolbar.hide();


    rebuild_editor = function(inline, resize_enabled) {
      var opts = {
        skin: 'ozone-bootstrap',
        resize_enabled: !!resize_enabled
      };

      if (CKEDITOR) {
        if (inline) {
          ckeditor = CKEDITOR.inline('blog-editable', opts);
        } else {
          ckeditor = CKEDITOR.replace('blog-editable', opts);
        }
      }
    };

    destroy_editor = function() {
      if (CKEDITOR && CKEDITOR.instances['blog-editable']) {
        CKEDITOR.instances['blog-editable'].destroy(true);
      }
    };


    var btnBottom, btnRight;
    popin = function() {
      $container
        .removeClass('floating')
        .addClass('fixed')
        .css({
          'position': 'fixed',
          'width': '100%',
          'left': 'auto',
          'margin-left': 'auto',
          'top': 'auto',
          'bottom': '0px'
        });

      $toolbar.hide();
      $blogtab.show();

      popped = false;

      destroy_editor();
      rebuild_editor();

      $submit.css({
        'bottom': btnBottom,
        'top': 'auto',
        'right': btnRight
      });
    };

    popout = function() {
      var width = $container.width();
      var new_width;
      popped = true;


      new_width = Math.floor(width * 0.9);
      $blogtab.hide();
      $container
        .removeClass('fixed')
        .addClass('floating')
        .css({
          'position': 'absolute',
          'width': new_width + 'px',
          'left': (width/2 - new_width/2) + 'px',
          'top': $(document).scrollTop() + 32 + 'px',
          'bottom': 'auto'
        });

      $toolbar.show();

      btnBottom = $submit.css('bottom');
      btnRight = $submit.css('right');

      $submit.css({
        'bottom': 'auto',
        'top': '2px',
        'right': '2px'
      });

      destroy_editor();
      rebuild_editor(false, true);
    };

    if ($.fn.tooltip) {
       $blogtab.tooltip({
        title: settings.tooltip
      });
    }

    $submit.hide();
    var toggleBlog = function() {
      if (popped) {
        popin();
      }

      if ($blogtab.data('open') === true) {
        $submit.fadeOut();
        $blogarea.animate({
          height: '0px'
        }, function() {
          $blogarea.hide();
          destroy_editor();

          $blogtab
            .removeClass('open')
            .addClass('closed');

          if ($.fn.tooltip) {
             $blogtab.tooltip({
              title: settings.tooltip
            });
          }

          settings.hide();
        });


        $blogtab.data('open', false);
      } else {
        $blogarea.show();

        $editable.attr('contentEditable', true);
        rebuild_editor();
        
        $blogtab
          .removeClass('closed')
          .addClass('open');

        if ($.fn.tooltip) {
          $blogtab.tooltip('destroy');
        }

        $blogtab.data('open', true);

        $blogarea.animate({
          height: container_height + 'px'
        }, function() {
          $submit.fadeIn();
        });

        settings.show();
      }
    };

    var btnInactive = true;
    $(document).on('mouseover', 'img', function() {
      if ($blogtab.data('open')) {
        btnInactive = false;

        var $img = $(this);

        $addBtn.unbind('click');
        $addBtn.css({
          'left': ($img.offset().left + $img.width() - $addBtn.width() - 18) + 'px',
          'top': ($img.offset().top + 2) + 'px'
        }).show();

        $addBtn.bind('click', function() {
          // TODO: ensure src url is global
          ckeditor.insertHtml('<img src="' + $img.attr('src') + '" width="' + $img.width() + '" height="' + $img.height() + '">');
        });
      }
    }).on('mouseout', 'img', function() {
      btnInactive = true;
      setTimeout(function() {
        if (btnInactive) {
          $addBtn.unbind('click');
          $addBtn.hide();
        }
      }, 200);
    });

    $addBtn.mouseover(function() {
      btnInactive = false;
    }).mouseout(function() {
      btnInactive = true;
      setTimeout(function() {
        if (btnInactive) {
          $addBtn.unbind('click');
          $addBtn.hide();
        }
      }, 200);
    });

    $blogtab.bind('click', toggleBlog);
    $toolbar.bind('click', function() {
      popin();
    });

    var dragging = false;
    var px = 0;
    var py = 0;
    $(document).on('mousedown', '#cke_blog-editable .cke_top', $toolbar, function(evt) {
      dragging = true;
      px = $container.offset().left - evt.pageX;
      py = $container.offset().top - evt.pageY;

    }).on('mouseup', function() {
      dragging = false;
    }).on('mousemove', function(evt) {
      if (dragging) {
        if (!popped) {
          popout();
        }

        $container.css('top', (py + evt.pageY) + 'px');
        $container.css('left', (px + evt.pageX) + 'px');

        evt.preventDefault();
      }
    });
  };
})(jQuery);