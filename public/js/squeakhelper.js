console.log('Ready!');

function copyURI(evt) {
  console.log('link copied!');
  evt.preventDefault();
  navigator.clipboard.writeText(evt.path[1].href);
}
