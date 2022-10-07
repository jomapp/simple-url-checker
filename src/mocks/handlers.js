import {rest} from 'msw';
import Bottleneck from "bottleneck";

export const handlers = [
    rest.post('https://api.munichsdorfer.de/checkurlexists', (req, res, ctx) => {

        return req.json().then((data) => {
            const urlString = data.urlString;

            let isUrlExists = true
            let isFile = RegExp("[a-z]+\/+[a-z]*\\.[a-z]+$").test(urlString);
            let isTutanotaDomain = RegExp("(tutanota\.com)([\/\:]|$)").test(urlString);
            let isPersonalDomain = RegExp("(munichsdorfer\.de)([\/\:]|$)").test(urlString);

            return res(ctx.json({
                    urlString: urlString,
                    isUrlExists: isUrlExists,
                    isFile: isFile,
                    isTutanotaDomain: isTutanotaDomain,
                    isPersonalDomain: isPersonalDomain
                })
            );
        });
    }),
]