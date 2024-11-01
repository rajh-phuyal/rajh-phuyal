// function scrollToSection(sectionId) {
//     document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
// }

function scrollToSection(sectionId) {
    $('html, body').animate({
        scrollTop: $('#' + sectionId).offset().top
    }, 800);
}

$(window).on('load', function () {
    // Remove the 'initial-hidden' class from sections once the page is fully loaded
    $('#random, #writings, #experiences').removeClass('initial-hidden').addClass('visible')
});


$(document).ready(function () {
    let $skillCards = $('.skill-card');
    let $body = $('body');
    let $skillModal = $('#skill-modal');
    let $skillModalContent = $skillModal.find('.skill-modal-content');

    // Click event for expanding the card
    $skillCards.on('click', function (e) {
        return;

        // Prevent the click from triggering if close button is clicked
        if ($(e.target).hasClass('close-button')) {
            return;
        }

        let $card = $(this);

        // Clone the content of the card-content
        let $cardContent = $card.find('.card-content').clone();

        // Clear previous content and append new content
        $skillModalContent.find('.card-content').remove();
        $skillModalContent.append($cardContent);

        // Add fade-in class after appending content
        let $modalCardContent = $skillModalContent.find('.card-content');

        // Add index to each child for staggered animation
        $modalCardContent.find('> *').each(function (index) {
            $(this).css('--child-index', index);
        });

        $modalCardContent.addClass('fade-in');

        // Show the modal
        $skillModal.fadeIn(300);
        $body.addClass('modal-open');
    });

    // Close button inside the modal content
    $skillModal.on('click', '.close-button', function (e) {
        e.stopPropagation();
        $skillModal.fadeOut(300, function () {
            // Remove content after fade out
            $skillModalContent.find('.card-content').remove();
        })
        $body.removeClass('modal-open');
    });

    // Click outside the modal content to close
    $skillModal.on('click', function (e) {
        if ($(e.target).is($skillModal)) {
            $skillModal.fadeOut(500, function () {
                // Remove content after fade out
                $skillModalContent.find('.card-content').remove();
            });
            $body.removeClass('modal-open');
        }
    });

    // Keyboard navigation for accessibility
    $skillCards.on('keydown', function (e) {
        let $card = $(this);

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            $card.click(); // Trigger the click event
        }
    });

    // Global event listener for the Escape key to close the modal
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $skillModal.is(':visible')) {
            $skillModal.fadeOut(300, function () {
                // Remove content after fade out
                $skillModalContent.find('.card-content').remove();
            });
            $body.removeClass('modal-open');
        }
    });
});