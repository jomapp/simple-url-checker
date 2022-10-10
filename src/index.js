import Bottleneck from "bottleneck";

const m = require("mithril");
const {worker} = require('./mocks/browser');
worker.start();

const limiter = new Bottleneck({
    minTime: 250,
    maxConcurrent: 1,
    highWater: 4,
    strategy: Bottleneck.strategy.LEAK,
});

const _START_HEADLINE_TEXT = "Start typing to check if an URL exists ... ✍️";
const _DEFAULT_HEADLINE_TEXT = "This URL does not exist 😥.";

const urlPattern = new RegExp('^(https?:\\/\\/)?' + // taken from https://stackoverflow.com/a/5717133/5777211
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');

let resultHeadlineText = _START_HEADLINE_TEXT;
let resultSublineText = "";
let currentInput = "";

const UrlCard = {
    view: function () {
        return m("main", {class: "flex items-start mx-8 my-8"}, [
            m("div", {class: "w-full bg-white rounded-xl border border-gray-200 drop-shadow-lg p-8"}, [
                m("h1", {class: "text-4xl text-center mb-8 block font-mono"}, "Simple URL Checker 🌍"),
                m("form", {
                    onsubmit: function (e) {
                        e.preventDefault();
                    }
                }, [
                    m("label.label", {class: "text-2xl font-mono rounded-xl bg-blue-50 p-1 px-3"}, "URL"),
                    m("input.input[type=text][placeholder=example.com]", {
                        class: "mt-3 p-3 w-full bg-blue-50 border border-blue-500 rounded-xl block font-mono focus:ring-blue-500 focus:border-blue-500 ",
                        oninput: function (e) {
                            currentInput = e.target.value.toLowerCase();

                            const urlString = currentInput;
                            if (urlString.length === 0) {
                                resultHeadlineText = _START_HEADLINE_TEXT;
                                resultSublineText = "";
                            } else {
                                checkUrlExists(urlString);
                            }
                        },
                    }),
                ]),
                m("h1", {class: "text-3xl block mt-16 font-mono"}, resultHeadlineText),
                m("h1", {class: "text-xl block mt-4 font-mono"}, resultSublineText),
                m("a", {
                    class: "bg-transparent inline-block mr-4 mt-16 hover:bg-blue-500 text-blue-700 font-mono hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-xl",
                    href: "https://munichsdorfer.de/en/",
                }, "munichsdorfer.de"),
                m("a", {
                    class: "bg-transparent inline-block mt-4 hover:bg-blue-500 text-blue-700 font-mono hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-xl",
                    href: "https://github.com/jomapp/simple-url-checker",
                }, "code"),
            ])
        ]);
    }
};

function isValidURL(urlString) {
    return urlPattern.test(urlString);
}

function checkUrlExists(urlString) {
    if (!isValidURL(urlString)) {
        resultHeadlineText = _DEFAULT_HEADLINE_TEXT;
        resultSublineText = "";
    } else {
        limiter.schedule(() =>
            m.request({
                method: "POST",
                url: "https://api.munichsdorfer.de/checkurlexists",
                body: {urlString: urlString},
                withCredentials: true,
            })
        ).then(function (data) {
            if (currentInput === data.urlString) {
                let resultString = ``;

                if (data.isUrlExists) {
                    resultString = resultString + `This URL does exist 🎉 and points 🧭 to a `;
                }
                if (data.isFile) {
                    resultString = resultString + `file 💾. `;
                } else {
                    resultString = resultString + `directory 📁. `;
                }

                resultHeadlineText = resultString;

                if (data.isTutanotaDomain) {
                    resultSublineText = `It is a \"Tutanota\" domain 🎉😊.`;
                }
                if (data.isPersonalDomain) {
                    resultSublineText = `It is my own domain 🎉👍.`;
                }
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
}

m.mount(document.body, UrlCard);
