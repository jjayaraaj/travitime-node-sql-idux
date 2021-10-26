let nodemailer = require('nodemailer');

module.exports.GmailTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.google.com",
    secure:false,
    port: 587,
    auth: {
        user: "career.saravanakumar@gmail.com",
        pass: "PASWORD_HERE"
    }
});

module.exports.SMTPTransport = nodemailer.createTransport({
    host: "SMTP_SERVICE_HOST",
    port: "SMTP_SERVICE_PORT",
    secure: "SMTP_SERVICE_SECURE", // upgrade later with STARTTLS
    debug: true,
    auth: {
        user: "SMTP_USER_NAME",
        pass: "SMTP_USER_PASSWORD"
    }
});

module.exports.ViewOption = (transport, hbs) => {
    transport.use('compile', hbs({
        viewEngine: {
            extname: '.hbs', // handlebars extension
            partialsDir: './email/templates/partials',
            layoutsDir: './email/templates/layouts',
            defaultLayout: "default",
        },
        viewPath: './email/templates/',
        extName: '.hbs'
    }));
}