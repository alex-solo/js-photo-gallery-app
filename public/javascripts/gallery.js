$(function() {
  var photos;
  var templates = {};

  $("script[type='text/x-handlebars']").each(function() {
    var $tmpl = $(this);
    templates[$tmpl.attr("id")] = Handlebars.compile($tmpl.html()); 
  });

  $("[data-type=partial]").each(function() {
    var $partial = $(this);
    Handlebars.registerPartial($partial.attr("id"), $partial.html());
  });

  var slideshow = {
    $el: $("#slideshow"),
    duration: 500,
    previousSlide: function(event) {
      event.preventDefault();

      var $currentFig = this.$el.find("figure:visible");
      var $prevFig = $currentFig.prev("figure");
  
      if ($prevFig.length === 0) {
        $prevFig = this.$el.find("figure").last();
      }

      var newIdx = $prevFig.attr("data-id");
  
      $currentFig.fadeOut(this.duration);
      $prevFig.fadeIn(this.duration);

      this.renderPhotoContent(newIdx);
    },
    nextSlide: function(event) {
      event.preventDefault();
  
      var $currentFig = this.$el.find("figure:visible");
      var $nextFig = $currentFig.next("figure");
  
      if ($nextFig.length === 0) {
        $nextFig = this.$el.find("figure").first();
      }

      var newIdx = $nextFig.attr("data-id");
  
      $currentFig.fadeOut(this.duration);
      $nextFig.fadeIn(this.duration);

      this.renderPhotoContent(newIdx);
    },
    renderPhotoContent: function(idx) {
      $("form").find("[name=photo_id]").val(idx);
      renderPhotoInformation(+idx);
      getCommentsFor(idx);
    },
    bind: function() {
      this.$el.find("a.prev").on("click", this.previousSlide.bind(this)); // if we just use "this.previousSlide" without binding the context is DOM element.
      this.$el.find("a.next").on("click", this.nextSlide.bind(this));
    },
    init: function() {
      this.bind();
    },
  };


  $("section > header").on("click", ".actions a", function(e) {
    e.preventDefault();

    var $e = $(e.currentTarget);
      
    var path = $e.attr("href");
    var idx = $e.attr("data-id");

    $.ajax({
      url: path,
      data: "photo_id=" + idx,
      type: "POST",
    })
    .done(function(json) {
      var photo_index = slideshow.$el.find("figure:visible").index();
      var current_photo = photos[photo_index];
      $e.text(function(i, text) {
        return text.replace(/\d+/, json.total);
      });

      current_photo[$e.attr("data-property")] = json.total;
    })
    .fail(function(errorThrown) {
      console.log("FAIL");
    });
  });

  $("form").on("submit", function(e) {
    e.preventDefault();

    var $form = $(this);

    $.ajax({
      url: $form.attr("action"),
      type: $form.attr("method"),
      data: $form.serialize(),
    })
    .done(function(json) {
      console.dir(json); 
      var $comment = templates.comment(json);
      $("#comments ul").append($comment);
      $form[0].reset();
    });
  });

  $.ajax({
    // default type: "GET" so we don't have to include it.
    url: "/photos",
    dataType: "json",
  })
  .done(function(json) {
    photos = json;
    renderPhotos();
    renderPhotoInformation(photos[0].id);
    slideshow.init();
    getCommentsFor(photos[0].id);
  });

  function renderPhotos() {
    $("#slides").html(templates.photos({photos: photos}));
  }

  function renderPhotoInformation(idx) {
    var photo = photos.find(function(photoObj) {
      return photoObj.id === idx;
    });

    $("section > header").html(templates.photo_information(photo));
  }

  function getCommentsFor(idx) {
    $.ajax({
      url: "/comments",
      data: "photo_id=" + idx,
    })
    .done(function(json) {
      comments = json;
      $("#comments ul").html(templates.comments({comments: comments}));
    });
  }

  // Like a photo



  // Using the core $.ajax() method
  //$.ajax({
  // 
  //    // The URL for the request
  //    url: "post.php",
  // 
  //    // The data to send (will be converted to a query string)
  //    data: {
  //        id: 123
  //    },
  // 
  //    // Whether this is a POST or GET request
  //    type: "GET",
  // 
  //    // The type of data we expect back
  //    dataType : "json",
  //})
  //  // Code to run if the request succeeds (is done);
  //  // The response is passed to the function
  //  .done(function( json ) {
  //     
  //  })
  //  // Code to run if the request fails; the raw request and
  //  // status codes are passed to the function
  //  .fail(function( xhr, status, errorThrown ) {
  //    
  //  })
  //  // Code to run regardless of success or failure;
  //  .always(function( xhr, status ) {
  //    
  //  }); 
})