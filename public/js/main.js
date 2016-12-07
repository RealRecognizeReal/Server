$(function () {

    function transform(strokes) {
        for (var i = 0; i < strokes.length; ++i)
            for (var j = 0, stroke = strokes[i]; j < stroke.length; ++j)
                strokes[i][j] = [strokes[i][j][0], strokes[i][j][1]];
        return strokes;
    };

    function urlParam(name) {
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(top.window.location.href);
        return (results !== null) ? results[1] : undefined;
    };

    var $canvas = $('#drawing-canvas').sketchable({
        graphics: {
            strokeStyle: "black",
            firstPointSize: 2
        }
    });

    function clearStrokes() {
        $canvas.sketchable('clear');
        $('.result').empty();
    };

    function submitStrokes() {
        var $submit = $('a#send'), $latex = $('#eq-latex'), $render = $('#eq-render');
        var strokes = $canvas.sketchable('strokes');
        // Submit strokes in the required format.
        strokes = transform(strokes);
        var postdata = {strokes: JSON.stringify(strokes)};
        if (urlParam("train")) {
            postdata.label = $('#train').val();
            postdata.user = urlParam("user");
        }
        $.ajax({
            url: "/api/search/formulaHand",
            type: "POST",
            data: postdata,
            beforeSend: function (xhr) {
                $submit.hide();
                var loading = '<div id="loading"> \
                          <h3 class="inline">인식중...</h3> \
                          <h4>시간이 걸릴수 있습니다.</h4> \
                         </div>';
                $('.eq').prepend(loading);
                $latex.empty();
                $render.empty();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('.eq').html('<h2>' + textStatus + '</h2><p>' + errorThrown + '</p>');
            },
            success: function (data, textStatus, jqXHR) {
                if (!data) {
                    $('.eq').html('<h2>Server not available.</h2><p>Please try again later. We apologize for the inconvenience.</p>');
                    return false;
                }
                $submit.show();
                $('#loading').remove();
                var asurl = encodeURIComponent(data);
                var query = '<p id="query">Search this in \
            <a target="_blank" href="https://www.google.es/search?q=' + asurl + '">Google</a> \
            or in <a target="_blank" href="https://www.wolframalpha.com/input/?i=' + asurl + '">Wolfram|Alpha</a>.';
                $latex.html(data + '<br/>' + query);
                $render.html('\\[' + data.latex + '\\]');
                MathJax.Hub.Typeset();

                $('#result').html(data.latex);
            }
        });
    };

    $('a#clear').on("click", function (e) {
        e.preventDefault();
        clearStrokes();
    });

    $('a#send').on("click", function (e) {
        e.preventDefault();
        submitStrokes();
    });

    $('a#undo').on("click", function (e) {
        e.preventDefault();
        $canvas.sketchable('undo');
    });

    $('a#redo').on("click", function (e) {
        e.preventDefault();
        $canvas.sketchable('redo');
    });

    $('a#refresh').on("click", function (e) {
        e.preventDefault();
        location.reload();
    });

    if (urlParam("train")) {
        // Shortcut to clear canvas + submit strokes.
        $(document).on("keydown", function (e) {
            //if (e.ctrlKey && e.which == 65) { // This can be exhausting.
            if (e.which == 45 || e.which == 96) { // Better be pressing a single key, e.g. INS.
                e.preventDefault();
                submitStrokes();
                clearStrokes();
            }
        });
    }

    // Render LaTeX math expressions on page load.
    MathJax.Hub.Config({showMathMenu: false});
    MathJax.Hub.Typeset();
});
