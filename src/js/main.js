// Load Styles
import '../scss/main.scss';
import escapeHtml from 'escape-html';
import { initBootstrap } from "./bootstrap.js";

const url = 'https://github.com/sle118/squeezelite-esp32/commit/'
// Loading bootstrap with optional features
initBootstrap({
  tooltip: true,
  popover: true,
  toasts: true,
});
function sortReleases(p1,p2){
  return p1.bits==p2.bits?0:p1.bits<p2.bits?-1:1
}
const sanitizer = new Sanitizer();
function getRevisionLine(description) {
  let table = ''
  description.split('\n').forEach(l => {
    let matches = /^(?<commit>[^\s]{7})\s(?<desc>.*)\((?<date>20\d{2}-\d{2}-\d{2}.*)\)\s\<(?<author>.*)\>/gm.exec(l)
    if (matches) {
      table += `<tr>
    <td><a href="${url}/${matches.groups.commit}">${matches.groups.commit}</a></td>
    <td>${escapeHtml(matches.groups.desc)}</td>
    <td>${matches.groups.date}</td>
    <td>${matches.groups.author}</td>
    </tr>`
    }
  })
  return table

}

function populateList(json) {
  let output = ''
  Object.keys(json).forEach(function (platform) {

    output += `<div class="accordion-item">
    <h2 class="accordion-header" id="h${platform}">
    <button class="accordion-button"  type="button" data-bs-toggle="collapse" 
     data-bs-target="#c_${platform}" aria-expanded="false" aria-controls="c_${platform}">
    ${platform}
    </button>
    </h2>
    <div id="c_${platform}" class="accordion-collapse collapse" aria-labelledby="h${platform}" data-bs-parent="#platforms"   style="">
        <div class="accordion-body">
        <div class="accordion" id="p${platform}">`
    json[platform].sort(sortReleases)
    json[platform].forEach((elem) => {

        output+= `<div class="accordion-item">
          <h3 class="accordion-header" id="h${elem.entry}">
          <button class="accordion-button"  type="button" data-bs-toggle="collapse" 
           data-bs-target="#c_${elem.entry}" aria-expanded="false" aria-controls="c_${elem.entry}">
          Version ${elem.version} from branch ${elem.branch}, ${elem.bits} bits
          </button>
          </h3>
          <div id="c_${elem.entry}" class="accordion-collapse collapse" aria-labelledby="h${elem.entry}" data-bs-parent="#p${platform}"   style="">
          
          <div class="accordion-body">
          <esp-web-install-button align = "center"  manifest="${elem.manifest}" ></esp-web-install-button>
          <table class="table table-striped table-hover ">
          <thead>
              <tr>
                <th>Commit</th>
                <th>Description</th>
                <th>Date</th>
                <th>Author</th>
              </tr>
            </thead>
            <tbody>
                    ${getRevisionLine(elem.description)}
            </tbody>
          </table>
          </div>
      
      </div>
      </div>`
      
    })
    
    output += `</div></div></div></div>`
  })
  let l = document.getElementById("platforms")
  l.innerHTML = output
}

fetch('./artifacts/manifest')
  .then((response) => response.json())
  .then((resp) => {
    let platforms = {}
    resp.forEach((element) => {
      let platform = `${element.release_details.platform}`
      if (!platforms[platform]) {
        platforms[platform] = []
      }
      platforms[platform].push({ 'branch': element.release_details.branch, 'bits': element.release_details.bitrate, 'version': element.release_details.version, entry: platform + element.release_details.version.replace('.', '_') + '-' + element.release_details.bitrate, 'manifest': element.manifest_name, 'description': element.description })
    })
    populateList(platforms)
  })
