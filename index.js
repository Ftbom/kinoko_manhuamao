const URL = require('./baseurl');
const baseURL = URL.baseURL;

class IndexController extends Controller {
    load() {
        this.data = {
            tabs: [
                {
                    "title": "推荐",
                    "id": "home",
                    "url": baseURL,
                },
                {
                    "title": "少年系列",
                    "id": "shaonian",
                    "url": baseURL + "/list/a-0-c-0-t-2-y-0-i-0-m-0.html"
                },
                {
                    "title": "少女系列",
                    "id": "shaonv",
                    "url": baseURL + "/list/a-0-c-0-t-1-y-0-i-0-m-0.html"
                },
                {
                    "title": "青年系列",
                    "id": "qingnian",
                    "url": baseURL + "/list/a-0-c-0-t-3-y-0-i-0-m-0.html"
                }, 
            ]
        };
    }
}

module.exports = IndexController;