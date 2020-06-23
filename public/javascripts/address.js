
(function () {
    var file = "/files/Province.txt";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          var allText = rawFile.responseText;
  
          var pros = JSON.parse(allText);
  
          var provinces = pros.map((pro) => {
            return `<option value="${pro.id}">${pro.name}</option>`;
          });
  
          console.log(provinces);
  
          document.getElementById("province_select").innerHTML = provinces.join(
            ""
          );
  
          var proSelect = document.getElementById("province_select");
  
          proSelect.addEventListener("change", () => {
            var selectedProvince = parseInt(proSelect.value);
  
            var file = "/files/District.txt";
            var rawFile = new XMLHttpRequest();
            rawFile.open("GET", file, false);
            rawFile.onreadystatechange = function () {
              if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                  var allText = rawFile.responseText;
  
                  var dicts = JSON.parse(allText);
  
                  console.log(dicts);
                  console.log(selectedProvince);
  
                  var filteredDistricts = dicts.filter(
                    (dict) => dict.subid === selectedProvince
                  );
  
                  console.log(filteredDistricts);
  
                  var districts = filteredDistricts.map((dict) => {
                    return `<option value="${dict.id}">${dict.name}</option>`;
                  });
  
                  console.log(districts);
  
                  document.getElementById(
                    "district_select"
                  ).innerHTML = districts.join("");
  
                  var dictSelect = document.getElementById("district_select");
  
                  dictSelect.addEventListener("change", () => {
                    var selectedDistrict = parseInt(dictSelect.value);
  
                    var file = "/files/Ward.txt";
                    var rawFile = new XMLHttpRequest();
                    rawFile.open("GET", file, false);
                    rawFile.onreadystatechange = function () {
                      if (rawFile.readyState === 4) {
                        if (rawFile.status === 200 || rawFile.status == 0) {
                          var allText = rawFile.responseText;
  
                          var wards = JSON.parse(allText);
  
                          var filteredWards = wards.filter(
                            (ward) => ward.subid === selectedDistrict
                          );
  
                          var wards2 = filteredWards.map((ward) => {
                            return `<option value="${ward.id}">${ward.name}</option>`;
                          });
  
                          console.log(wards2);
  
                          document.getElementById(
                            "ward_select"
                          ).innerHTML = wards2.join("");
                        }
                      }
                    };
                    rawFile.send(null);
                  });
                }
              }
            };
            rawFile.send(null);
          });
        }
      }
    };
    rawFile.send(null);
    // var data = JSON.stringreadTextFile('/javascripts/Province.txt');
  
    //     var blogs = blogPosts.map(blog => {
    //   return `<article><h2>${blog.title}</h2><p>${blog.body}</p></article>`
    // });
  
    //   document.getElementById('output').innerHTML = blogs.join('');
  })();