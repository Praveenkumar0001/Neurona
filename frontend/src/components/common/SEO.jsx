import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({
    title = 'Neurona',
    description = 'Neurona - Your AI powered platform',
    keywords = 'AI, Neurona, platform',
    author = 'Neurona Team',
    lang = 'en',
    meta = [],
}) => {
    return (
        <Helmet
            htmlAttributes={{ lang }}
            title={title}
            meta={[
                {
                    name: 'description',
                    content: description,
                },
                {
                    name: 'keywords',
                    content: keywords,
                },
                {
                    name: 'author',
                    content: author,
                },
                ...meta,
            ]}
        />
    );
};

export default SEO;