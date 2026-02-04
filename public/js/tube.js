$(function () {
    $('#searchbox').autocomplete({
        source: function (request, response) {
            let searchTerm = request.term.trim();
            if (searchTerm.length > 0) {
                $.ajax({
                    url: '/wkt/back/suggest',
                    data: { keyword: searchTerm },
                    success: function (data) {
                        response(data.length > 0 ? data : getSearchHistory());
                    }
                });
            } else {
                response(getSearchHistory());
            }
        },
        delay: 1,
        minLength: 0,

        // ★ ここが最重要：候補を選んだときに POST を強制する
        select: function (event, ui) {
            $('#searchbox').val(ui.item.value);

            const form = document.getElementById("searchForm");
            form.method = "POST";      // ← POST を強制
            form.action = "/search";   // ← /search に送る
            form.submit();             // ← GET にならない
        }
    });

    function getSearchHistory() {
        let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        return history;
    }

    $('#searchbox').on('focus', function () {
        const q = document.getElementById('searchbox').value;
        if (q) {
            $(this).autocomplete('search', q);
        } else {
            $(this).autocomplete('search', '');
        }
    });
});
