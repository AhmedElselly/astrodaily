//toggle edit review method
$('.toggle-edit-form').on('click', function(){
    $(this).text() === 'Edit' ? $(this).text('Cancel'): $(this).text('Edit');
    $(this).siblings('.edit-review-form').toggle();
});
