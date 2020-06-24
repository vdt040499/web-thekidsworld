const fs = require('fs');

module.exports.address = (address, province, district, ward) => {
    var prov, dist, ward2;

    var provinces = JSON.parse(fs.readFileSync('./public/files/Province.txt'));

    provinces.forEach((pro) => {
        if (pro.id === parseInt(province)) {
            prov = pro.name;
        }
    });

    var districts = JSON.parse(fs.readFileSync('./public/files/District.txt'));

    districts.forEach((dis) => {
        if (dis.id === parseInt(district)) {
            dist = dis.name;
        }
    });

    var wards = JSON.parse(fs.readFileSync('./public/files/Ward.txt'));

    wards.forEach((wa) => {
        if(wa.id === parseInt(ward)) {
            ward2 = wa.name;
        }
    });

    var add = `${address}, ${ward2}, ${dist}, ${prov}`;

    return add;
}