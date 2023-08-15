exports.getLastNews= async (req, res) => {

    let errors = '';
    let query = `SELECT * from news
    WHERE status = '1'
    ORDER BY id_news DESC LIMIT 3`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));

        res.render('pages/newsShort',{errors:errors,news:parseRes})
    })
}

exports.detailNews= async (req, res) => {

    let errors = '';
    let query = `SELECT * from news
    WHERE id_news = '${req.query.newsId}'`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));

        res.render('pages/detailNews',{errors:errors,news:parseRes})
    })
}

exports.allNews= async (req, res) => {

    let errors = '';
    let query = `SELECT * from news
    WHERE status = '1'
    ORDER BY id_news DESC`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));

        res.render('pages/allNews',{errors:errors,news:parseRes})
    })
}