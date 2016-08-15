(function() {
  $('[id^="opendownload"]').click(function() {
    $('#modal-download').show();
  });

  $('#close-modal-download').click(function() {
    $('#modal-download').hide();
  });

  $('#openmenu').click(function() {
    $('#sidebar').animate({
      'margin-left': '-0px'
    }, 400);
  });

  $('#close-sidebar').click(function() {
    $('#sidebar').animate({
      'margin-left': '-252px'
    }, 400);
  });

  $('section#topbar').animate({
    'opacity': 1
  }, 600);

  $('section#board h1').animate({
    'margin-top': '10px',
    'opacity': 1
  }, 600);

  $('section#board div').animate({
    'opacity': 1
  }, 600);

  $('section#board').animate({
    'padding-bottom': '45px'
  }, 600);

}).call(this);

//# sourceMappingURL=../maps/coffee/main.js.map
