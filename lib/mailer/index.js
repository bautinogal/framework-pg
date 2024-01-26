// import nodemailer from 'nodemailer';
// import env from '../../config/env';

// exports.sendSignUpMail = (data) => new Promise((res, rej => {
//     const transport = {
//         host: "email-smtp.us-east-2.amazonaws.com",
//         port: 587,
//         secure: false, // upgrade later with STARTTLS
//         auth: {
//             user: env.smtp.user,
//             pass: env.smtp.pass,
//         }
//     }
//     const message = {
//         from: "ingesursi@ingesursi.com.ar",
//         to: data.email,
//         subject: "Usuario registrado en IngesurSI",
//         text: `La contraseña que se le asignó al registrarse en el sistema es: ${data.password} Recuerde cambiarla al ingresar al sistema por primera vez para mayor seguridad.`,
//         html: `
//         <div>
//         <h2>Bienvenido al sistema de IngesurSI</h2>
//         <p>
//         Su usuario se registró exitosamente. Se le asignó una contraseña para ingresar al sistema. Recuerde cambiarla una vez que haya ingresado por primera vez al sistema.
//         </p>
//         <h2>Contraseña: <i>${data.password}</i></h2>
//         <b></b>
//         </div>`
//     }
//     let transporter = nodemailer.createTransport(transport);
//     //transporter.verify((error, success) => error ? rej("Error al generar mail de nuevo usuario") : null);

//     transporter.sendMail(message, (err, info) => err ? rej(err) : res(info));
// }));

export default {}
