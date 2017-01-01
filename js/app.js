// location_img_list: [imageUrl,imageLoc_lat,imageLoc_lon,imageLoc_name,imageText,imageTime,imageStUrl]
// imageUrl: low resolution image url
// imageTime: 
// imageStUrl: standard resolution image url

var location_img_list = new Array();
var marker_list;
var infowindow_list;

function getImgList(data) {
    for (var i = data.children.length - 1; i >= 0; i--) {
        if (!('image' in data.children[i])) {
            continue;
        }
        if (!('location' in data.children[i])) {
            continue;
        }

        time = data.children[i].fileSystemInfo.createdDateTime;
        lat = data.children[i].location.latitude;
        long = data.children[i].location.longitude;
        imageUrl = data.children[i].thumbnails[0].c200x150_Crop.url;
        imageStUrl = data.children[i].thumbnails[0].large.url;

        location_img_list.push([imageUrl, lat, long, "", "", time, imageStUrl])
    }

    // return location_img_list;
}

function placeMarker(map, img_info) {
    var latlng = new google.maps.LatLng(img_info[1], img_info[2]);
    //get array of markers currently in cluster
    var allMarkers = marker_list;
    //final position for marker, could be updated if another marker already exists in same position
    var finalLatLng = latlng;
    //check to see if any of the existing markers match the latlng of the new marker
    if (allMarkers.length != 0) {
        for (i = 0; i < allMarkers.length; i++) {
            var existingMarker = allMarkers[i];
            var pos = existingMarker.getPosition();
            //if a marker already exists in the same position as this marker
            if (latlng.equals(pos)) {
                //update the position of the coincident marker by applying a small multipler to its coordinates
                var newLat = latlng.lat() + (Math.random() - .5) / 1500; // * (Math.random() * (max - min) + min);
                var newLng = latlng.lng() + (Math.random() - .5) / 1500; // * (Math.random() * (max - min) + min);
                finalLatLng = new google.maps.LatLng(newLat, newLng);
            }
        }
    }
    var image = {
        url: img_info[0],
        // This marker is 20 pixels wide by 32 pixels high.
        // size: new google.maps.Size(32, 32),
        // The origin for this image is (0, 0).
        // origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        // anchor: new google.maps.Point(0, 32)
        scaledSize: new google.maps.Size(42, 42) // set the size of icon
    };
    var marker = new google.maps.Marker({
        position: finalLatLng,
        icon: image,
        map: map
    });

    marker_list.push(marker);
    var postdate = new Date(img_info[5]);
    var infocontent = "";

    google.maps.event.addListener(marker, 'click', function() {
        // use google map geocoder to geocode the address from lat and lng
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'location': finalLatLng }, function(results, status) {
            var addr;
            if (status === google.maps.GeocoderStatus.OK) {
                if (results.length >= 2) {
                    addr = results[2].formatted_address;
                } else {
                    addr = results[results.length - 1].formatted_address;
                }
            } else {
                addr = img_info[3];
            }

            infocontent = '<div>' +
                '<h4>' + postdate.getFullYear() + '/' + postdate.getMonth() + '/' + postdate.getDate() + '<br/>' + addr + '</h4>' +
                '<center><img class="img-rounded" src="' + img_info[6] + '" width="90%"/></center>' +
                '<p style="margin-top:8px">' + img_info[4].replace("\n", "<br/>"); + '</p>' + '</div>';

            var infowindow = new google.maps.InfoWindow({
                content: infocontent,
                maxWidth: 300
            });
            // To automaticly close other infowindow when click this marker!
            if (infowindow_list.length != 0) {
                for (var j = 0; j < infowindow_list.length; j++) {
                    infowindow_list[j].close();
                }
            }
            infowindow.open(map, marker);
            infowindow_list.push(infowindow);
        });
    });
}


function resizeIcon(map) {
    //when the map zoom changes, resize the icon based on the zoom level so the marker covers the same geographic area
    map.addListener('zoom_changed', function() {
        var pixelSizeAtZoom0 = 40; //the size of the icon at zoom level 0
        var maxPixelSize = 130; //restricts the maximum size of the icon, otherwise the browser will choke at higher zoom levels trying to scale an image to millions of pixels

        var zoom = map.getZoom();
        // alert(zoom);
        var relativePixelSize = Math.round(pixelSizeAtZoom0 * Math.pow(1.1, zoom - 7)); // use 2 to the power of current zoom to calculate relative pixel size.  Base of exponent is 2 because relative size should double every time you zoom in
        // alert(relativePixelSize);
        if (relativePixelSize > maxPixelSize) //restrict the maximum size of the icon
            relativePixelSize = maxPixelSize;

        //change the size of the icon
        for (var i = 0; i < marker_list.length; i++) {
            var marker = marker_list[i]
            marker.setIcon(
                new google.maps.MarkerImage(
                    marker.getIcon().url, //marker's same icon graphic
                    null, //size
                    null, //origin
                    null, //anchor
                    new google.maps.Size(relativePixelSize, relativePixelSize) //changes the scale
                )
            );
        }

    });
}

function myMap(callback) {
    var mapCanvas = document.getElementById("map");
    // var mapCanvas = $( '#map' ); //?????
    var mapOptions = {
        center: new google.maps.LatLng(23.79, 120.79),
        zoom: 7
    }
    var map = new google.maps.Map(mapCanvas, mapOptions);
}
