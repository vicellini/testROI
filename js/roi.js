$(document).ready(function() {
  let validDate
  let publicRepo
  let finalIndexArr = []

  //run top level api call
  $.when(
    $.ajax({
      url: "https://api.github.com/orgs/boomtownroi",
      type: "get",
      data: "a=b",
    }).done(function(data, statusText, xhr) {
      console.log(data)
      publicRepo = data.public_repos;

      //test update date accuracy 
      let createDate = new Date(data.created_at)
      let updateDate = new Date(data.updated_at)
      if (updateDate > createDate) {
        validDate = true;
      }
      $.map(data, function(prop) {
        var propString = String(prop)

        //look for aditional api's that match and perform HTTP request 

        if (propString.slice(0, 40) === "https://api.github.com/orgs/BoomTownROI/") {
          $.ajax({
            url: propString + '?page=1&per_page=100',
            type: "get",
            data: "a=b",
            async: false //Depreciated... 
          }).done(function(data, statusText, xhr) {
            let status = xhr.status
            let propName = propString.slice(40);
            let finalObj = {};

            //check for status code and save results

            if (status != 200) {
              finalObj[propName] = "Not Found";
              finalIndexArr.push(finalObj);
            } else {
              let idArr = [];
              $.map(data, function(prop) {
                let idInt = parseInt(prop.id)
                idArr.push(idInt)
              });
              finalObj[propName] = idArr;
              finalIndexArr.push(finalObj);
            }
            console.log(propName, finalObj)
          })
        }
      })
    })
  ).then(function() {

    //after ajax requests, verify public repo value is the same as total repos from api

    let totalRepos
    let isRepoAccurate
    $.each(finalIndexArr, function(i, obj) {
      if (obj.repos != undefined) {
        totalRepos = obj.repos.length;

        if (totalRepos === publicRepo) {
          isRepoAccurate = true;
        }
      }
    })

    //Add all collected data to html file

    $("#update-test").html(validDate);
    $("#repos-test").html(isRepoAccurate);
    $("#public-repo-total").html(publicRepo);
    $("#repo-url-total").html(totalRepos);
    let allIdHtml = $.map(finalIndexArr, function(prop, i) {
      let keyName
      var idArr = prop[Object.keys(prop)[0]];
      for (key in prop) {
        keyName = key.charAt(0).toUpperCase() + key.slice(1);
      }
      console.log(keyName)
      let resultHtml = $.map(idArr, function(number, index) {
        return '<p class="col-xs-12 col-md-3"><strong>' + number + '</strong></p>'
      })
      return '<h3 class="mt-4 mb-2">' + keyName + '</h3><div class="row bg-light">' + resultHtml.join('') + "</div>";
    })
    idHtml = allIdHtml.join('');
    console.log(idHtml)
    $("#results").append(idHtml)
  })
});