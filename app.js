const BASE_URL = "https://api.harvardartmuseums.org";
const KEY = "apikey=aea3dc70-af6a-11ea-8c14-216b8fa77b20"; // USE YOUR KEY HERE
// noticed once i hit module 2 that this code wasnt needed. I decided to keep it for reference.
// function fetchObjects() {
//   const url = `${BASE_URL}/object?${KEY}`;
// 
//   fetch(url)
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (response) {
//       console.log(response);
//     })
//     .catch(function (error) {
//       console.error(error);
//     });
// }


// fetches the data object and returns ajson elemement
async function fetchObjects() {
  const url = `${BASE_URL}/object?${KEY}`;
  onFetchStart();
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}
fetchObjects();


// grabs all the century elements inside the data and returns the information into records object.
// it also sets the local storage of your page so that instead of making multiple request everytime you load the page it
//reduces the number of request you make drastically by setting the local storage on your device.
async function fetchAllCenturies() {
  const centuriesURL = `${BASE_URL}/century?${KEY}&size=100&sort=temporalorder`;
  if (localStorage.getItem("centuries")) {
    return JSON.parse(localStorage.getItem("centuries"));
  }
  onFetchStart();
  try {
    const response = await fetch(centuriesURL);
    const { records, info } = await response.json();
    localStorage.setItem("centuries", JSON.stringify(records));
    return records, info;
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}
fetchAllCenturies();
// fetches the classifications object and returns them into records so that later when you render your objects you can grab both centuries
// and classification much easier while setting the local storage like we did above to limit the number of request for data
// made to the api.
async function fetchAllClassifications() {
  const classificationURL = `${BASE_URL}/classification?${KEY}&size=100&sort=name`;
  if (localStorage.getItem("classifications")) {
    return JSON.parse(localStorage.getItem("classifications"));
  }
  try {
    const classResponse = await fetch(classificationURL);
    const { records, info } = await classResponse.json();

    localStorage.setItem("classifications", JSON.stringify(records));
    return records, info;
  } catch (error) {
    console.error(error);
  }
}
fetchAllClassifications();


// makes a function that renders the centuries and classifications functions into text 
async function prefetchCategoryLists() {
  onFetchStart();
  try {
    const [classifications, centuries] = await Promise.all([
      fetchAllClassifications(),
      fetchAllCenturies(),
    ]);

    $(".classification-count").text(`${classifications.length}`);

    classifications.forEach((classification) => {
      let classHtml = $(`<option value="${classification.name}">${classification.name}</option>
    
      `);
      $("#select-classification").append(classHtml);
    });

    $(".century-count").text(`${centuries.length}`);

    centuries.forEach((century) => {
      let centuryHtml = $(`<option value="${century.name}">${century.name}</option>
    
      `);
      $("#select-century").append(centuryHtml);
    });
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}
// builds the search string once you search by setting the elements below to .val()
// once thats done it maps classearchquery so that each line can be join with an equal and a "&" symbol
// that fits proper url structure
function buildSearchString() {
  classSearchQuery = {
    classification: $("#select-classification").val(),
    century: $("#select-century").val(),
    keyword: $("#keywords").val(),
  };

  const searchQuery = Object.entries(classSearchQuery)
    .map(function (line) {
      return line.join("=");
    })
    .join("&");

  const newClassURL = `${BASE_URL}/object?${KEY}&${encodeURI(searchQuery)}`;
  return newClassURL;
}
buildSearchString();
// builds the submit event on the site so that once submit is clicked it retrieves the build search string and 
// sets records and info into an object that can be called when reult.json is finished
// get the url from `buildSearchString`
// fetch it with await, store the result
$("#search").on("submit", async function (event) {
  event.preventDefault();
  onFetchStart();
  try {
    const result = await fetch(buildSearchString());
    const { records, info } = await result.json();
    updatePreview(records, info);
    return records;

  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
});
// these are made for the loading of the site
function onFetchStart() {
  $("#loading").addClass("active");
}

function onFetchEnd() {
  $("#loading").removeClass("active");
}

prefetchCategoryLists();
// renders the preview of the site to show the data from records that has description, image, and title and will not show anything if there
// is no data present thats what the ternaries are for.
function renderPreview(record) {
  const { description, primaryimageurl, title } = record;
  let newRecord = $(`
<div class="object-preview">
<a href="${primaryimageurl}"> ${
    primaryimageurl && title
      ? `<img src="${primaryimageurl}" />
<h3>${title}</h3>`
      : title
        ? `<h3>${title}</h3>`
        : description
          ? `<h3>${description}</h3>`
          : `<img src="${primaryimageurl}" />`
    }
  

</a>
</div>
`).data("record", record);

  return newRecord;
}
// updates preview page of the site to show or not show the previous or the next buttons.
// if infonext is present then it will return the info next will be enabled 
// same with infoprevious
// it also loops through and appends it to the renderpreview function

function updatePreview(records, info) {
  const root = $("#preview");
  let results = root.find(".results").empty();

  if (info.next) {
    $(".next").data("url", info.next);
    $(".next").attr("disabled", false);
  } else {
    $(".next").data(null);
    $(".next").attr("disabled", true);
  }
  if (info.prev) {
    $(".previous").data("url", info.prev);
    $(".previous").attr("disabled", false);
  } else {
    $(".previous").data(null);
    $(".previous").attr("disabled", true);
  }



  $(".results").empty();
  records.forEach(function (record) {
    results.append(renderPreview(record));
  });
}


//   read off url from the target 
// fetch the url
// read the records and info from the response.json()
//so that the information is passed into the proper buttons
// update the preview
$("#preview .next, #preview .previous").on("click", async function () {
  onFetchStart();

  try {
    const target = $(this).data("url");
    const results = await fetch(target);
    const { records, info } = await results.json();
    updatePreview(records, info);
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }


});
$("#preview").on("click", ".object-preview", function (event) {
  event.preventDefault();

  const record = $(this).data("record");

  $("#feature").html(renderFeature(record));

});

//renders the features so that all of these objects informations is passed into the html properly.
// also maps through people and adds the proper syntax to it.
function renderFeature(record) {
  const {
    title,
    dated,
    description,
    culture,
    style,
    technique,
    medium,
    dimensions,
    people,
    department,
    division,
    contact,
    creditline,
    images,
    primaryimageurl,
  } = record;


  return $(`<div class="object-feature">
  <header>
    <h3>${title}</h3>
    <h4>${dated}</h4>
  </header>
  <section class="facts">
   ${factHTML("Culture", culture, "culture")}
   ${factHTML("Style", style)}
   ${factHTML("description", description)}
   ${factHTML("technique", technique, "technique")}
   ${factHTML("medium", medium, "medium")}
   ${factHTML("dimensions", dimensions)}
   ${factHTML("department", department)}
   ${factHTML("division", division)}
   ${factHTML("contact", contact)}
   ${factHTML("Creditline", creditline)}
   ${factHTML(
    "content",
    `<a target="_blank" href="mailto:${contact}">${contact}</a>`
  )}
    ${
    people
      ? people
        .map(function (person) {
          return factHTML("Person", person.displayname, "person");
        })
        .join("")
      : ""
    }
   
  </section>
  <section class="photos">
  ${photosHTML(images, primaryimageurl)}
  </section>
  </div>`);
}
//builds the search url for facthtml below so that the proper Search Query is used inside of it.
// and allows for you to search inside of those certain elements when they are rendered onto the page.
function searchURL(searchType, searchString) {
  return `${BASE_URL}/object?${KEY}&${searchType}=${searchString}`;
}
function factHTML(title, content, searchTerm = null) {
  if (!content) {
    return ""
  } else if (!searchTerm) {
    return `
   <span class="title">${title}</span>
  <span class="content">${content}</span>
   `;
  } else {

    return `
  <span class="title">${title}</span>
  <span class="content"><a href="${searchURL()}">${content}</a></span>
   `
  }




}
// renders the photos that are inside render preview 
function photosHTML(images, primaryimageurl) {
  if (images && images.length > 0) {
    return images.map(
      image => `<img src="${image.baseimageurl}" />`
    ).join('');
  } else if (primaryimageurl) {
    return `<img src = "${primaryimageurl}"/>`;
  } else {
    return "";
  }
}
// when a feature anchor is clicked it will render the preview into the feature.
$("#feature").on("click", "a", async function (event) {
  const target = $(this).attr("href");
  if (target.startsWith("mailto:")) {
    return;
  }

  event.preventDefault();
  onFetchStart();
  try {
    const response = await fetch(target);
    const { records, info } = await response.json();
    updatePreview(records, info);
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }


});
