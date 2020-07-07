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

module.exports.revert = (address) => {
    var prov, dist, ward2;

    address = address.split(",");

    let province = address[address.length - 1].slice(1, address[address.length - 1].length);
    let district = address[address.length - 2].slice(1, address[address.length - 2].length);
    let ward = address[address.length - 3].slice(1, address[address.length - 3].length);

    let address2 = "";
    for(let i=0; i <= address.length - 4; i++) {
        if ( i == 0 ) {
            address2 = address2.concat(address[i]);
        } else {
            address2 = address2.concat("," + address[i]);
        }
    }

    var provinces = JSON.parse(fs.readFileSync('./public/files/Province.txt'));

    provinces.forEach((pro) => {
        if (pro.name === province) {
            prov = parseInt(pro.id);
        }
    });

    var districts = JSON.parse(fs.readFileSync('./public/files/District.txt'));

    districts.forEach((dis) => {
        if (dis.name === district) {
            dist = parseInt(dis.id);
        }
    });

    var wards = JSON.parse(fs.readFileSync('./public/files/Ward.txt'));

    wards.forEach((wa) => {
        if(wa.name === ward) {
            ward2 = parseInt(wa.id);
        }
    });

    return [prov, dist, ward2, address2];
}

