# Kir-Dev E-mail template and implementation
## The template
The template in this repository contains a unified base design for all applications. It is responsive also.
Each project should use this or its own template based on this. Please don't change the footer too much!
## Nest implementation
I would recommend using ejs for the template engine. In this repository you can find a mailing module and service
written for NestJS. Just import it inside your AppModule as described below and start using it
### Installation
There are two dependencies (besides NestJS) for this module: `axios` and `ejs`.
Please install them using your favorite package manager!
Copy the module and service wherever you want!
Copy the `template.html` as `template.ejs` and start digging into it, you can use anything EJS supports.
### Import
You should use the `forRoot` static function to inject the configuration for the module:
```typescript
@Module({
    imports: [
        MailingModule.forRoot({
            templates: {
                default: 'template/template.ejs', // If you don't pass a template name to generateMail
                example: 'template/example.ejs',
            },
            mailServerUrl: '<mail server url here>',
            apiKey: '<key here>',
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
```
### Usage
You can generate the e-mail HTML to be sent via `generateMail(values: unknown, templateName?: string = 'default')`.
You can pass in any object, it depends on what you have written inside the EJS file.
Use the `sendMail(data: SendMail[])` function to send an email in the correct format, where SendMail:
```typescript
{
  to: string; // The e-mail receiver's address
  from: string; // The name that should appear in the e-mail from field
  subject: string; // Subject of the e-mail
  html: string; // Syntactically correct HTML (just pass in the previously generated html)
}
```