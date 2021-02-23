/**
 * Author: Elia Contini <https://elia.contini.page/>
 */
const mongoose = require("mongoose");
const { Schema } = mongoose;

const shortUrlSchema = new Schema({
    short: {
        required: true,
        type: Number,
    },
    source: {
        required: true,
        type: String,
    },
});
let ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);

const storage = (mongoUri) => {
    mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const shortUrlBase = "/api/shorturl/";

    return {
        addEntry: async (url) => {
            if (!/^http:\/\/|https:\/\//g.test(url)) {
                url = "http://" + url;
            }

            const entry = await ShortUrl.find({ source: url });
            if (entry.length === 0) {
                //
                // https://forum.freecodecamp.org/t/settled-auto-increment-an-id-in-mongoose/55805/4
                //
                // Interesting even
                // https://stackoverflow.com/questions/28357965/mongoose-auto-increment#30164636
                //
                const counter = await ShortUrl.estimatedDocumentCount();

                const shortId = counter + 1;

                const shortUrl = new ShortUrl({
                    short: shortId,
                    source: url,
                });

                return await shortUrl.save();
            }

            return entry[0];
        },
        getEntry: async (shortUrl) => {
            const entry = await ShortUrl.find({ short: shortUrl });

            if (entry.length === 0) {
                return null;
            }

            return entry[0];
        },
    };
};

module.exports = storage;
