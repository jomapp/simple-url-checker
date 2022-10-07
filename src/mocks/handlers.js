import {rest} from 'msw';
import Bottleneck from "bottleneck";

const limiter = new Bottleneck({
    minTime: 250,
    maxConcurrent: 1,
    highWater: 0,
    strategy: Bottleneck.strategy.OVERFLOW,
});

export const handlers = [
    rest.post('https://api.munichsdorfer.de/checkurlexists', (req, res, ctx) => {

        return limiter.schedule(() =>
            req.json().then((data) => {
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
            })
        ).then((result) => {
            return result;
        }).catch(() => {
            return res(
                ctx.status(429));
        });
    }),
]