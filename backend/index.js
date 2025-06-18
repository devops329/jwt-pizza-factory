const app = require('./service');
const port = process.argv[2] || 4000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
