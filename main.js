const URL = require('./baseurl');
const baseURL = URL.baseURL;

class MainController extends Controller {

    load(data) {
        this.id = data.id;
        this.url = data.url;
        this.page = 0;

        var cached = this.readCache();
        let list;
        if (cached) {
            list = cached.items;
        } else {
            list = [];
        }

        this.data = {
            list: list,
            loading: false,
            hasMore: this.id !== 'home'
        };

        this.userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36';

        if (cached) {
            let now = new Date().getTime();
            if (now - cached.time > 30 * 60 * 1000) {
                this.reload();
            }
        } else {
            this.reload();
        }

    }

    async onPressed(index) {
        await this.navigateTo('book', {
            data: this.data.list[index]
        });
    }

    onRefresh() {
        this.reload();
    }

    async onLoadMore() {
        this.setState(() => {
            this.data.loading = true;
        });
        try {
            let page = this.page + 1;
            let url = this.makeURL(page);
            let res = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                },
            });
            let text = await res.text();
            this.page = page;
            let items = this.parseData(text, url);
    
            this.setState(()=>{
                for (let item of items) {
                    this.data.list.push(item);
                }
                this.data.loading = false;
                this.data.hasMore = this.id != 'home';
                console.log(`id: ${this.id} ${this.data.hasMore}`)
            });
        } catch (e) {
            showToast(`${e}\n${e.stack}`);
            this.data.hasMore = false;
            this.setState(()=>{
                this.data.loading = false;
            });
        }
        
    }

    makeURL(page) {
        if (this.id == 'home') {
            return this.url;
        } else if (page != 0) {
            return this.url.replace('.html', `-page-${page + 1}.html`);
        } else {
            return this.url;
        }
    }

    async reload() {
        this.setState(() => {
            this.data.loading = true;
        });
        try {
            let url = this.makeURL(0);
            let res = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                },
            });
            let text = await res.text();
            let items = this.parseData(text, url);
            this.page = 0;
            localStorage['cache_' + this.id] = JSON.stringify({
                time: new Date().getTime(),
                items: items,
            });
            this.setState(()=>{
                this.data.list = items;
                this.data.loading = false;
                this.data.hasMore = this.id != 'home';
            });
        } catch (e) {
            showToast(`${e}\n${e.stack}`);
            this.data.hasMore = false;
            this.setState(()=>{
                this.data.loading = false;
            });
        }
    }

    readCache() {
        let cache = localStorage['cache_' + this.id];
        if (cache) {
            let json = JSON.parse(cache);
            return json;
        }
    }

    parseData(text, url) {
        if (this.id == 'home') {
            return this.parseHomeData(text, url);
        } else {
            return this.parsePageData(text, url);
        } 
    }

    parseHomeData(html, url) {
        const doc = HTMLParser.parse(html);
        let results = [];
        let content = doc.querySelectorAll('.bg-white')[1];
        let comic_items = content.querySelectorAll('.comicbook-index');
        let categroy_title = [];
        for (let item of content.querySelectorAll('.justify-content-between')) {
            categroy_title.push(item.querySelector('h2').textContent);
        }
        for (let i = 0; i < 4; i++) {
            results.push({
                header: true,
                title: categroy_title[i],
                icon: ''
            });
            for (let j = 0; j < 12; j++) {
                let index = j + i * 12;
                let item_a = comic_items[index].querySelectorAll('a');
                results.push({
                    title: item_a[1].textContent,
                    subtitle: item_a[2].textContent,
                    link: item_a[0].getAttribute('href'),
                    picture: comic_items[index].querySelector('img').getAttribute('src'),
                    pictureHeaders: {
                        Referer: baseURL
                    },
                });
            }
        }
        return results;
    }

    parsePageData(text, url) {
        const doc = HTMLParser.parse(text);
        let results = [];
        let boxes = doc.querySelectorAll('.comic-book-unit');
        for (let box of boxes) {
            let item_info = box.querySelectorAll('a');
            let item = {};
            item.link = item_info[0].getAttribute('href');
            item.picture = box.querySelector('img').getAttribute('src');
            item.title = item_info[1].textContent;
            item.subtitle = box.querySelector('.list-inline').querySelector('a').textContent;
            item.pictureHeaders = {
                Referer: baseURL
            };
            results.push(item);
        }
        return results;
    }
}

module.exports = MainController;
