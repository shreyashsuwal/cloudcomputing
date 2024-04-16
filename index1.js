const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import Axios for making HTTP requests

const app = express();
const port = 80;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

const AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-1', 
});
//  create a new instance of the AWS dynamodb
const DynamoDB = new AWS.DynamoDB()

//  create a new instance of the AWS S3
const s3 = new AWS.S3();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route handler for handling user login attempts
app.post('/login', async (req, res) => {
  try {
    // Extract email and password from the request body
    const { email, password } = req.body;

    const response = await axios.post('https://enikknhrk7.execute-api.us-east-1.amazonaws.com/default/login', { email, password });

    // Handle the response from the Lambda function
    if (response.status === 200) {
      // If login is successful, redirect to the user area
      // res.send(`/user?user_name=${response.data.user_name}`);
      // Redirect to the user area route with user_name parameter
      res.redirect(`/user?user_name=${response.data.user_name}`);
    } else {
      // If login failed, send an error message
      res.send('Login failed');
    }
  } catch (error) {
    // If an error occurs, send an error message
    console.error('Error logging in:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Other routes and configurations...

// Route handler for GET requests to the '/login' endpoint
app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: __dirname });
});



// Route handler for GET requests to the '/register' endpoint
app.get('/register', (req, res) => {
  res.sendFile('./register.html', { root: __dirname });
});


// Route handler for handling user registration
app.post('/register', async (req, res) => {
  const { email, user_name, password } = req.body;

  try {
    // Make HTTP request to the API Gateway endpoint that triggers the Lambda function
    const response = await axios.post('https://msvq5vnp9j.execute-api.us-east-1.amazonaws.com/default/register', { email, user_name, password });
    
    // Handle response from Lambda function
    if (response.status === 200) {
      // Registration successful, redirect to login page
      res.redirect('/login');
    } else {
      // Registration failed, display error message
      res.send('Registration failed');
    }
  } catch (error) {
    // If any error occurs, display error message
    console.error('Error registering user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/user', (req, res) => {
  const user = req.query.user_name;
  res.send(`
        <html>
          <head>
            <title>User Area</title>
          </head>

          <body>
          <a href="/user?user_name=${user}"/>User Area</a>  
          <a href="/subscription?user_name=${user}"/>Subscription Area</a>
          <a href="/query?user_name=${user}"/>Query Area</a>
          <a href="/login"/>Log Out</a>
            <h1>Welcome ${user}</h1>`)
})

app.get('/subscription', async (req, res) => {
  const user = req.query.user_name;

  try {
    const response = await axios.get(`https://q9v103dzkk.execute-api.us-east-1.amazonaws.com/default/subscription?user_name=${user}`);

    if (response.status === 200) {
      const subscriptionData = response.data;
      res.send(renderSubscriptionPage(subscriptionData, user));
    } else if (response.status === 404) {
      res.send(renderNoSubscriptionPage(user));
    } else {
      res.status(response.status).send('Error retrieving subscriptions');
    }
  } catch (error) {
    console.error('Error retrieving subscriptions:', error);
    res.status(500).send('Internal Server Error');
  }
});

function renderSubscriptionPage(subscriptionData, user) {
  let html = `
    <html>
      <head>
        <title>Subscription Area</title>
      </head>
      <body>
        <a href="/user?user_name=${user}">User Area</a>
        <a href="/subscription?user_name=${user}">Subscription Area</a>
        <a href="/query?user_name=${user}">Query Area</a>
        <a href="/login">Log Out</a>
        <ul>
  `;
  subscriptionData.forEach(item => {
    html += `
          <li>
            <img src="${item.imageUrl}" /> <!-- Use the pre-signed URL here -->
            ${item.artist.S} ${item.title.S}
            <form action="/remove" method="post">
              <input type="hidden" name="user_name" value="${user}">
              <input type="hidden" name="title" value="${item.title.S}">
              <input type="hidden" name="artist" value="${item.artist.S}">
              <button type="submit">Remove</button>
            </form>
          </li>
    `;
  });
  html += `
        </ul>
      </body>
    </html>
  `;
  return html;
}

function renderNoSubscriptionPage(user) {
  return `
    <html>
      <head>
        <title>Subscription Area</title>
      </head>
      <body>
        <a href="/user?user_name=${user}">User Area</a>
        <a href="/subscription?user_name=${user}">Subscription Area</a>
        <a href="/query?user_name=${user}">Query Area</a>
        <a href="/login">Log Out</a>
        <p>No subscriptions found</p>
      </body>
    </html>
  `;
}



// Route handler for rendering dashboard
app.get('/dashboard', async (req, res) => {
  const user = req.query.user_name;

  try {
    // Make HTTP request to the API Gateway endpoint that triggers the Lambda function
    const response = await axios.get(`https://ze1zs3h4x5.execute-api.us-east-1.amazonaws.com/default/dashboard`, {
      params: {
        user_name: user
      }
    });

    // Handle response from Lambda function
    if (response.status === 200) {
      // Dashboard data received, render the page
      res.send(renderDashboardPage(response.data, user));
    } else {
      // Other error occurred, handle appropriately
      res.status(response.status).send('Error retrieving dashboard data');
    }
  } catch (error) {
    // If any error occurs, display error message
    console.error('Error retrieving dashboard data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Function to render the dashboard page
function renderDashboardPage(data, user) {
  return `
    <html>
      <head>
        <title>Dashboard</title>
      </head>
      <body>
        <a href="/user?user_name=${user}">User Area</a>
        <a href="/subscription?user_name=${user}">Subscription Area</a>
        <a href="/query?user_name=${user}">Query Area</a>
        <a href="/login">Log Out</a>
        <h1>Welcome ${user}</h1>

        <form action="/query" method="post">
          <label for="title">Title:</label>
          <input type="text" id="title" name="title"><br><br>

          <label for="year">Year:</label>
          <input type="text" id="year" name="year"><br><br>

          <label for="artist">Artist:</label>
          <input type="text" id="artist" name="artist"><br><br>

          <button type="submit">Query</button>
        </form>

        <h2>Subscription Area</h2>
        <ul>
          ${data.map(item => `
            <li>
              <img src="${item.artist}.jpg" />
              ${item.artist} ${item.title} ${item.year}
              <form action="/remove" method="post">
                <input type="hidden" name="title" value="${item.title}">
                <input type="hidden" name="artist" value="${item.artist}">
                <button type="submit">Remove</button>
              </form>
            </li>
          `).join('')}
        </ul>
      </body>
    </html>
  `;
}


app.post('/query', (req, res) => {
  const { title, year, artist } = req.body;

  const params = {
    TableName: 'music',
    FilterExpression: 'contains (#title, :title) AND contains (#year, :year) AND contains (#artist, :artist)',
    ExpressionAttributeNames: {
      '#title': 'title',
      '#year': 'year',
      '#artist': 'artist',
    },
    ExpressionAttributeValues: {
      ':title': { S: title },
      ':year': { S: year },
      ':artist': { S: artist },
    },
  };

  DynamoDB.scan(params, function (err, data) {
    if (err) {
      console.error('Unable to query music', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (data.Items.length === 0) {
        res.send('No result is retrieved. Please query again');
      } else {
        // Display queried music results
        const musicList = data.Items.map(item => `${item.artist.S} - ${item.title.S} (${item.year.S})`).join('<br>');
        res.send(musicList);
      }
    }
  });
});

app.get('/query', (req, res) => {
  const user = req.query.user_name;
  const title = req.query.title;
  const year = req.query.year;
  const artist = req.query.artist;

  if (!title && !year && !artist) {
    // Render the form for user to input the query
    res.send(`
      <html>
        <head>
          <title>Query Area</title>
        </head>
        <body>
          <a href="/user?user_name=${user}"/>User Area</a>  
          <a href="/subscription?user_name=${user}"/>Subscription Area</a>
          <a href="/query?user_name=${user}"/>Query Area</a>
          <a href="/login"/>Log Out</a>

          <form action="/query" method="get">
            <label for="title">Title:</label>
            <input type="hidden" name="user_name" value="${user}">
            <input type="text" id="title" name="title"><br><br>

            <label for="year">Year:</label>
            <input type="text" id="year" name="year"><br><br>

            <label for="artist">Artist:</label>
            <input type="text" id="artist" name="artist"><br><br>

            <button type="submit">Query</button>
          </form>
        </body>
      </html>
    `);
  } else {
    // Perform the query with provided parameters
    const params = {
      TableName: 'music',
      FilterExpression: 'contains (#title, :title) AND contains (#year, :year) AND contains (#artist, :artist)',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#year': 'year',
        '#artist': 'artist',
      },
      ExpressionAttributeValues: {
        ':title': { S: title },
        ':year': { S: year },
        ':artist': { S: artist },
      }
    };

    DynamoDB.scan(params, function (err, data) {
      if (err) {
        console.error('Unable to find music', err);
        res.status(500).send('Internal Server Error');
      } else {
        if (data.Items.length === 0) {
          res.send('No result is retrieved. Please query again');
        } else {
          // Render the results
          res.send(`
            <html>
              <head>
                <title>Query Area</title>
              </head>

              <body>
                <a href="/user?user_name=${user}"/>User Area</a>  
                <a href="/subscription?user_name=${user}"/>Subscription Area</a>
                <a href="/query?user_name=${user}"/>Query Area</a>
                <a href="/login"/>Log Out</a>

                <ul>
                  ${data.Items.map(
                    (item) => {
                      // Define parameters for the pre-signed URL
                      const params = {
                        Bucket: 's3980059-mybucket',
                        Key: 'artist_images/' + item.artist.S + '.jpg',
                        Expires: 36000 // Expiration time in seconds (e.g., 1 hour)
                      };

                      // Generate the pre-signed URL
                      const url = s3.getSignedUrl('getObject', params);
                      console.log(url)
                      return `
                        <li>
                          <img src="${url}" />
                          ${item.artist.S} ${item.title.S} ${item.year.S}
                          <form action="/subscribe" method="post">
                            <input type="hidden" name="user_name" value="${user}">
                            <input type="hidden" name="title" value="${item.title.S}">
                            <input type="hidden" name="artist" value="${item.artist.S}">
                            <button type="submit">Subscribe</button>
                          </form>
                        </li>
                      `
                    }
                  ).join('')}
                </ul>
              </body>
            </html>
          `);
        }
      }
    });
  }
});

app.post('/remove', async (req, res) => {
  const title = req.body.title;
  const artist = req.body.artist;
  const user = req.body.user_name;

  try {
    // Make HTTP request to the API Gateway endpoint that triggers the Lambda function
    const response = await axios.post(`https://f2iko7hl69.execute-api.us-east-1.amazonaws.com/default/remove`, {
      title: title,
      artist: artist,
      user_name: user
    });

    // Handle response from Lambda function
    if (response.status === 200) {
      // Subscription removed successfully, redirect to subscription page
      res.redirect(`/subscription?user_name=${user}`);
    } else {
      // Other error occurred, handle appropriately
      res.status(response.status).send('Error removing subscription');
    }
  } catch (error) {
    // If any error occurs, display error message
    console.error('Error removing subscription:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route handler for subscribing to music
app.post('/subscribe', async (req, res) => {
  const title = req.body.title;
  const artist = req.body.artist;
  const user = req.body.user_name;

  try {
    // Make HTTP request to the API Gateway endpoint that triggers the Lambda function
    const response = await axios.post(`https://vg6hwnnl27.execute-api.us-east-1.amazonaws.com/default/subscribe`, {
      title: title,
      artist: artist,
      user_name: user
    });

    // Handle response from Lambda function
    if (response.status === 200) {
      // Music subscribed successfully, redirect to query page
      res.redirect(`/query?user_name=${user}`);
    } else {
      // Other error occurred, handle appropriately
      res.status(response.status).send('Error subscribing music');
    }
  } catch (error) {
    // If any error occurs, display error message
    console.error('Error subscribing music:', error);
    res.status(500).send('Internal Server Error');
  }
});

