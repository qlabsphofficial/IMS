import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Grid } from '@mui/material';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    Name: '',
    Phone: '',
    Email: '',
    Subject: '',
    Message: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await postToGoogle();
    resetForm();
  };

  const postToGoogle = async () => {
    const formDataEncoded = new URLSearchParams({
      "entry.1745708738": formData.Name,
      "entry.59182023": formData.Phone,
      "entry.1051023346": formData.Email,
      "entry.1219777801": formData.Subject,
      "entry.47311120": formData.Message
    }).toString();
    
    try {
      await fetch("https://docs.google.com/forms/d/e/1FAIpQLSfpDckBsqpORR-xTzJnToOqDqu0upwKZUrbAwXyqOZr1ttbDQ/formResponse", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formDataEncoded
      });
    } catch (error) {
      console.error('Error posting to Google:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      Name: '',
      Phone: '',
      Email: '',
      Subject: '',
      Message: ''
    });
  };

  return (
    <Container maxWidth="lg" className="vg-page page-contact" id="contact">
      <Typography variant="h4" align="center" gutterBottom>Contact Us</Typography>
      <Grid container spacing={5} alignItems="center" sx={{justifyContent: 'center'}}>
        <Grid item xs={12} lg={5}>
          <form className="vg-contact-form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Your name"
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Your Phone Number"
                  type="tel"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Your Email Address"
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Subject"
                  type="text"
                  name="Subject"
                  value={formData.Subject}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Type your message here...."
                  multiline
                  rows={4}
                  name="Message"
                  value={formData.Message}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">Send Message</Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactForm;