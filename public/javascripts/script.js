$(function () {  
    if ($('textarea#ta').length) {
      console.log($('#ta'));
      ClassicEditor.create(document.querySelector( '#ta' )).then(() => {
        console.log('editor initialized');
      }).catch((err) => {
        console.log(err);
      });
    }

    $('a.confirmDeletion').on('click', function() {
        if(!confirm('Bạn thực sự muốn xóa ?')) return false; 
    });

    if ($('[data-fancybox]').length) {
      $('[data-fancybox]').fancybox();
    }
});
