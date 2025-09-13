import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { infoLogger } from './common/utils/logger/winston-logger-config';
import { HttpExceptionFilter } from './common/filters/HttpMessegeHandler';
dotenv.config({
    path: `${process.env.NODE_ENV}.env`,
});

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Validator
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        }),
    );
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    app.enableCors();

    // Swagger settings
    const options = new DocumentBuilder().setTitle('Example API').setDescription('The API description').setVersion('1.0').addTag('').addBearerAuth().build();

    const document = SwaggerModule.createDocument(app, options);

    // Count the endpoints
    const endpointsCount = Object.keys(document.paths).length;
    const updatedDescription = `The API description. Total endpoints: ${endpointsCount}`;

    // Update the Swagger options with the new description
    const updatedOptions = new DocumentBuilder()
        .setTitle('Example API')
        .setDescription(updatedDescription)
        .setVersion('1.0')
        .addTag('')
        .addBearerAuth()
        .build();

    const updatedDocument = SwaggerModule.createDocument(app, updatedOptions);
    SwaggerModule.setup('docs', app, updatedDocument);

    // JWT settings
    app.use(
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
        }),
    );
    app.use(passport.initialize());
    app.use(passport.session());

    app.useGlobalFilters(new HttpExceptionFilter());

    const port = process.env.SERVER_PORT;
    await app.listen(port);
    const info = {
        timestamp: new Date().toISOString(),
        message: `The server listens on port ${port}`,
    };
    infoLogger.info(info);
}

bootstrap();
