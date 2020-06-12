const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const sendEmail = async (email, description) => {
  console.log("sending email to ", email);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "iamtanujdwivedi123@gmail.com",
      pass: "tanuj@9116872987",
    },
  });

  const mailOptions = {
    from: "iamtanujdwivedi123@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Karona app todo reminder", // Subject line
    html: `<p>Pending Task : ${description}</p>`, // plain text body
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log(info);
  });
  return true;
};

const startMonitoring = async (todoId, email, date, description) => {
  schedule.scheduleJob(todoId.toString(), date, async () => {
    await sendEmail(email, description);
  });
  return true;
};

const changeTodoDeadline = async (todoId, email, date, description) => {
  const schedule_id = todoId;
  const cancelJob = schedule.scheduledJobs[schedule_id.toString()];
  if (cancelJob == null) {
    await startMonitoring(todoId, email, date, description);
    return false;
  }
  await cancelJob.cancel();
  await startMonitoring(todoId, email, date, description);
  return true;
};

const cancelJob = async (todoId) => {
  const schedule_id = todoId;
  const cancelJob = schedule.scheduledJobs[schedule_id.toString()];
  if (cancelJob == null) {
    return false;
  }
  console.log(cancelJob);
  await cancelJob.cancel();
  return true;
};

module.exports = {
  startMonitoring,
  changeTodoDeadline,
  cancelJob,
};
