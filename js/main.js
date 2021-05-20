

//Food Page Javascript
function removeOtherCuisine(className, displayState) {
    var elements = document.getElementsByClassName(className)

    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = displayState;
    }
}
function onClickItalianCuisine() {
    removeOtherCuisine('Italian', 'block'); // show
    removeOtherCuisine('Pakistani', 'none'); // hides
    removeOtherCuisine('Spanish', 'none'); // hides


}
function onClickPakistaniCuisine() {
    removeOtherCuisine('Pakistani', 'block'); // show
    removeOtherCuisine('Italian', 'none'); // hides
    removeOtherCuisine('Spanish', 'none'); // hides
}

function onClickSpanishCuisine() {
    removeOtherCuisine('Spanish', 'block'); // show
    removeOtherCuisine('Italian', 'none'); // hides
    removeOtherCuisine('Pakistani', 'none'); // hides
}
function AllCuisine() {
    removeOtherCuisine('Spanish', 'block'); // show
    removeOtherCuisine('Italian', 'block'); // show
    removeOtherCuisine('Pakistani', 'block'); // hides
}



//place Page JavaScript
function removeOtherPlaces(className, displayState) {
    var elements = document.getElementsByClassName(className)

    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = displayState;
    }
}
function onClickItalianPlaces() {
    removeOtherPlaces('Italian', 'block'); //show
    removeOtherPlaces('Pakistani', 'none'); // hides
    removeOtherPlaces('Spanish', 'none'); // hides


}
function onClickPakistaniPlaces() {
    removeOtherPlaces('Pakistani', 'block'); // show
    removeOtherPlaces('Italian', 'none'); // hides
    removeOtherPlaces('Spanish', 'none'); // hides
}

function onClickSpanishPlaces() {
    removeOtherPlaces('Spanish', 'block'); // show
    removeOtherPlaces('Italian', 'none'); // hides
    removeOtherPlaces('Pakistani', 'none'); // hides
}
function AllPlaces() {
    removeOtherPlaces('Spanish', 'block'); // show
    removeOtherPlaces('Italian', 'block'); // show
    removeOtherPlaces('Pakistani', 'block'); // show
}

//fashion Page Javascript

function removeOtherFashion(className, displayState) {
    var elements = document.getElementsByClassName(className)

    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = displayState;
    }
}

function onClickItalianFashion() {
    removeOtherFashion('Italian', 'block'); // show
    removeOtherFashion('Pakistani', 'none'); // hides
    removeOtherFashion('Spanish', 'none'); // hides


}
function onClickPakistaniFashion() {
    removeOtherFashion('Pakistani', 'block'); // show
    removeOtherFashion('Italian', 'none'); // hides
    removeOtherFashion('Spanish', 'none'); // hides
}

function onClickSpanishFashion() {
    removeOtherFashion('Spanish', 'block'); // show
    removeOtherFashion('Italian', 'none'); // hides
    removeOtherFashion('Pakistani', 'none'); // hides
}
function AllFashion() {
    removeOtherFashion('Spanish', 'block'); // show
    removeOtherFashion('Italian', 'block'); // show
    removeOtherFashion('Pakistani', 'block'); // show
}







