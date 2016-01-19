var isEncoded = function(str){
    return decodeURIComponent(str) !== str;
}

Handlebars.registerHelper('autoPlayFalseSoundCLoud', function(params) {
    return params.replace("&auto_play=true", "&auto_play=false");
});

Handlebars.registerHelper('autoPlayFalseYoutube', function(params) {
    return params.replace("&autoplay=1", "&autoplay=0");
});

Handlebars.registerHelper('ifCond', function(v1, options) {
    if(v1) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper("addOne", function(value, options)
{
    return parseInt(value) + 1;
});

Handlebars.registerHelper('safeString', function(object) {

    return new Handlebars.SafeString(
        "'"+object+"'"
    );
});

function toggleSFrame(index, url){
    var idS = "soundcloudIframe" + index;
    if($("#" + idS).attr("src") != url){
        $("#" + idS).attr("src", url);
    }
    $("#" + idS).toggle();
}
function toggleYFrame(index, url){
    var idY = "youtubeIframe" + index;
    if($("#" + idY).attr("src") != url){
        $("#" + idY).attr("src", url);
    }
    $("#" + idY).toggle();
}

function searchSong(inputText) {

    if(!isEncoded(inputText)){
        inputText = encodeURIComponent(inputText);
    }
    if(inputText.length == 0){
        return;
    }

	$.ajax({
		url : "http://localhost:3000/songName/" + inputText
	}).then(
			function(data) {
				emptyFields();
                fillTemplate(data);
				// TODO: Link to the searched song
				try {
                 //   if(data[0] != undefined){
				//	createSongSearched(data[0]);
				//	if (data[0].songMixs.length > 0) {
				//		createMatchesTextDiv("Next Song: ");
				//		for (i = 0; i < data[0].songMixs.length; i++) {
				//			matchesNum = i;
                 //           //SHOULD SEND ONLY DATA [i]
                 //           //.nextSong.songName,data[0].songMixs[i].nextSong.songArtist[0].artistName
				//			createMatches(data[0].songMixs[i]);
				//		}
				//	}
                    if(data[0] == undefined){
                        $('.songMatchesDiv').append(
                            "<h4>There are no songs that match your search, </h4><a href='/admin'>you can add it :)</a>");

                    }else if (data[0].songMixs == undefined){
                        $("#contenido").append(
                            "<ul><h4>There are no mixes that match your search, </h4><a href='/admin'>you can add one :)</a></ul>");
                    }else if (data[0].songMixs.length > 0){
                        fillMatchesTemplate(data);
                    }
				} catch (err) {
					$('.songMatchesDiv').append(
							"<h4>There are no songs that match your search</h4>");
					console.log(err);
				}
			});
}

function fillTemplate(data) {
    var source   = $("#songsTemplate").html();
    var template = Handlebars.compile(source);
    $("#contenido").append( template({objects:data}) );
}

function fillMatchesTemplate(data) {
    var source   = $("#matchesTemplate").html();
    var template = Handlebars.compile(source);
    $("#contenido").append( template({objects:data}) );
}

function emptyFields() {
    $('#contenido').empty();
	//$('#songSearched').empty();
	//$('.song-searched-text').empty();
	//$('.song-searched').empty();
	//$('.songMatchesDiv').empty();
}

var allSongsNames = new Array();
var allArtistsNames = new Array();
var allTracklistsNames = new Array();
var allButExcluded = new Array();

function defineNames() {
    $.ajax({
        url : "http://localhost:3000/song/"
    }).then(function(data) {
        // for(i = 0; i < data.length; i++){
        // allSongNames[i] = data[i].songOne;
        // }
        var seen = {};
        // allSongsNames = []; //TODO:NEED TO SOLVE THIS AS IF WE KEEP THE
        // SOURCE AND THE ALLSONGS VAR WE ARE USING THE DOUBLE OF SPACE
        var len = data.length;
        var j = 0;
        for (var i = 0; i < len; i++) {
            var item = {};
            item.songName = data[i].songName;
            item.songArtist = data[i].songArtist[0].artistName;
            //var item = data[i].songName;
            if (seen[item.songName] !== 1) {
                seen[item.songName] = 1;
                allSongsNames[j++] = item;
            }
        }
    });
}

// Testing purposes... Names need to be retrieved from Song collection AND/OR in
// another way to avoid the for loop

function defineArtists() {
	$.ajax({
		url : "http://localhost:3000/artist/"
	}).then(function(data) {
		// for(i = 0; i < data.length; i++){
		// allSongNames[i] = data[i].songOne;
		// }
		var seen = {};
		// allSongsNames = []; //TODO:NEED TO SOLVE THIS AS IF WE KEEP THE
		// SOURCE AND THE ALLSONGS VAR WE ARE USING THE DOUBLE OF SPACE
		var len = data.length;
		var j = 0;
		for (var i = 0; i < len; i++) {
			var item = data[i].artistName;
			if (seen[item] !== 1) {
				seen[item] = 1;
				allArtistsNames[j++] = item;
			}
		}
	});
}

function defineTracklists() {
    $.ajax({
        url : "http://localhost:3000/tracklists/"
    }).then(function(data) {
        // for(i = 0; i < data.length; i++){
        // allSongNames[i] = data[i].songOne;
        // }
        var seen = {};
        // allSongsNames = []; //TODO:NEED TO SOLVE THIS AS IF WE KEEP THE
        // SOURCE AND THE ALLSONGS VAR WE ARE USING THE DOUBLE OF SPACE
        var len = data.length;
        var j = 0;
        for (var i = 0; i < len; i++) {
            var item = data[i].tracklistName;
            if (seen[item] !== 1) {
                seen[item] = 1;
                allTracklistsNames[j++] = item;
            }
        }
    });
}



//FUNCTION USED TO EXCLUDE THE MATCHES WHEN ADDING A NEW MIX
//TODO: Still need to exclude the match created, otherwise song will still appear once we finish the insert
function excludeMixMatches(songName) {
    var excludeMatches = new Array();
    $.ajax({
        url : "http://localhost:3000/songName/" + songName
    }).then(function(data) {
        // for(i = 0; i < data.length; i++){
        // allSongNames[i] = data[i].songOne;
        // }
        var seen = {};
        // allSongsNames = []; //TODO:NEED TO SOLVE THIS AS IF WE KEEP THE
        // SOURCE AND THE ALLSONGS VAR WE ARE USING THE DOUBLE OF SPACE
        try{
            var len = data[0].songMixs.length;
            excludeMatches[0] = songName;
            var j = 1;
            for (var i = 0; i < len; i++) {
                var item = data[0].songMixs[i].nextSong.songName;
                if (seen[item] !== 1) {
                    seen[item] = 1;
                    excludeMatches[j++] = item;
                }
            }
        }catch(e) {
            excludeMatches[0] = songName;
        }
        console.log("I will exclude: " + excludeMatches);
        definePossibleMatches(excludeMatches);
    });
}

// DEFINE POSSIBLE MATCHES EXCLUDING THE MATCHES THAT A SONG ALREADY HAS
function defineExcludedTypeAhead() {
    $('#allButExcluded .typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    }, {
        name: 'states',
        displayKey: 'value',
        source: substringMatcher(allButExcluded)
    });
}

function definePossibleMatches(excludeMatches){
    $.ajax({
        url : "http://localhost:3000/song/"
    }).then(function(data) {
        // for(i = 0; i < data.length; i++){
        // allSongNames[i] = data[i].songOne;
        // }
        var seen = {};
        for (var i = 0; i < excludeMatches.length; i++) {
            seen[excludeMatches[i]] = 1;
        }
        // allSongsNames = []; //TODO:NEED TO SOLVE THIS AS IF WE KEEP THE
        // SOURCE AND THE ALLSONGS VAR WE ARE USING THE DOUBLE OF SPACE
        var len = data.length;
        var j = 0;
        for (var i = 0; i < len; i++) {
            var item = data[i].songName;
            if (seen[item] !== 1) {
                seen[item] = 1;
                allButExcluded[j++] = item;
            }
        }

        defineExcludedTypeAhead();
    });
}

function substringMatcher(strs) {
	return function findMatches(q, cb) {
		var matches, substrRegex;

		// an array that will be populated with substring matches
		matches = [];

		// regex used to determine if a string contains the substring `q`
		substrRegex = new RegExp(q, 'i');

		// iterate through the pool of strings and for any string that
		// contains the substring `q`, add it to the `matches` array
		$.each(strs, function(i, str) {
			if (substrRegex.test(str)) {
				// the typeahead jQuery plugin expects suggestions to a
				// JavaScript object, refer to typeahead docs for more info
				matches.push({
					value : str
				});
			}
		});

		if (matches.length === 0) {
			matches.push({
				value : "No results found :("
			});
		}

		cb(matches);
	};
}