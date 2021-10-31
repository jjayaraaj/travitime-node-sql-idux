let nodemailer = require('nodemailer');

module.exports.GmailTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.google.com",
    secure:false,
    port: 587,
    auth: {
        user: "travitimeapp@gmail.com",
        pass: "Travitime632@"
    }
});

module.exports.SMTPTransport = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure:true, // upgrade later with STARTTLS
    debug: true,
    auth: {
        user: "info@goidux.com",
        pass: "GoIdux@321"
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