const form = document.forms.form_input;
const elem = form.elements;

let getLastWeekDate = function () {
  let date = new Date();
  date.setDate(date.getDate()-5);
  let year = date.getFullYear();
  let month = date.getMonth()+1;
  let day = date.getDate();

  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = '0' + month;
  }

  let dt = year + '-' + month + '-' + day;

  elem.start.setAttribute('value', dt);
};

window.onload = function() {
  getLastWeekDate();
};

let buildReport = function() {
  const done_list = document.getElementById('sos_done');
  const doing_list = document.getElementById('sos_doing');

  let pr_repo = elem.pr_repo.value.split(',');
  let issues_repo = elem.issues_repo.value.split(',');
  let start = elem.start.value;
  let team = elem.team.value;
  let sprint = elem.sprint.value;
  let done_query = `type:pr is:closed closed:>` + start;
  let doing_query = `type:issue is:open label:${team} milestone:"${sprint}"`;

  let github_api_PR_repos=[];
  let github_api_issues_repos=[];

  pr_repo.forEach(function (repo) {
    github_api_PR_repos.push('https://api.github.com/search/issues?per_page=100&q=repo:'+repo+'+');
  });
  issues_repo.forEach(function (repo) {
    github_api_issues_repos.push('https://api.github.com/search/issues?per_page=100&q=repo:'+repo+'+');
  });

  let printPR = function(result) {
    let items = result.items;
    items.forEach(function (item) {
      let body = '';
      if (item.body && item.body !== '') {
        body = `
        <br>
        <ul style="list-style-type:circle">
          <li>${item.body}</li>
        </ul>
        `;
      }
      let title = item.title.split('):');
      done_list.insertAdjacentHTML('beforeend',`
        <li>
          <a href="${item.html_url}">#${item.number}</a> - ${title[1]?title[1]:item.title} 
          ${body}
        </li>
      `);
    });

  };

  let printIssues = function(result) {
    let items = result.items;
    items.forEach(function (item) {
      doing_list.insertAdjacentHTML('beforeend',`
        <li>
          <a href="${item.html_url}">#${item.number}</a> - ${item.title}
        </li>
      `);
    });
  };

  let getReport = function(repo, query, print) {
    $.ajax(repo + query, {
      dataType: 'json'
    }).done(function(data) {
      print(data)
    })
  };

  github_api_PR_repos.forEach(function (repo) {
    getReport(repo, done_query, printPR);
  });
  github_api_issues_repos.forEach(function (repo) {
    getReport(repo, doing_query, printIssues);
  });
};