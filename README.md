# harvard-art
This project demonstrates my capabilities to efficiently connect to a modern api.
It also displays my ability to design a front end experience for a user. 
The site loads and displays all relevant data, on demand.

<br>
#Search Bar

The Search Bar is the main entry point for all app functionality. Users will enter a search string, and 
possibly restrict down either by classification (things like Amulets or Photos) or by century by using a 
<select> tag that I populate by fetching the available classifications and centuries from the API.
<br>
 <br>
  
#Fetching Category Lists
created two build  functions: fetchAllCenturies and fetchAllClassifications. They will be called to get the categories that will be used in 
the search bar, and will use the data they fetch in a third function called prefetchCategoryLists which takes them and adds the fields to the
search bar.
//
the fetch all functions code will be called every time a user comes to this page, which means that we will be hitting the endpoint multiple times on page 
load for data which probably doesn't change very often. We can store the records in localstorage the first time we fetch it, and use the 
stored records instead if they exist.
//
<br>
 <br>
#buildSearchString
this function needs to take the values from keywords, select classifications, and select centuries. It interpolates them into a special http request 
that renders whatever values are returned from the api. I also use encode uri here to pass in the correct syntax returned from these values.
//
# rendering 
here I use a for each to go through all the elements returned by the api and select the items i want to be displayed on the page.
//
<br>
 <br>
# pagination
In addition to the records, here i have access to the info property on objects returned from the API. They will have up to two keys present: prev and next. 
The values are automatically generated search URLs based on our current search for the next page of results, or the previous page of results.
here we can grab those values and pass them into the buildsearch string func to return a responsive url.
//
<br>
 <br>
#renderFeature
renders a feature object with sample api data when a user searches a prticular thing. it also has the capabilty to project a certain set of data
onto the page when the user clicks on the feature.

