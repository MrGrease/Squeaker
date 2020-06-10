document.getElementById('deleteprof').addEventListener('click', deleteProf);

console.log('connected!');

function deleteProf() {
  console.log('Goodbye :(');

  const xhr = new XMLHttpRequest();

  xhr.open('DELETE', '/user/deleteprofile', true);

  xhr.onload = function () {
    if (this.status == 200) {
      console.log('profile deleted');
      window.location.assign('/');
    }
  };

  xhr.send();
}
