document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  
});

window.onpopstate = function(event){
  console.log(event.State.mailbox);
  load_mailbox(event.State.mailbox);
}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-load').style.display = 'none';
  //Taking input from the form 
  document.querySelector('form').onsubmit =()=>{
    const data = {
      'recipients': document.querySelector('#compose-recipients').value ,
      'subject' : document.querySelector('#compose-subject').value ,
      'body' : document.querySelector('#compose-body').value,
    }
    fetch('/emails', {
      method: 'POST',
      headers1: {
        'accept':'application/json',
        'content-type':' multipart/form-data'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(()=> {
        // Redirecting to sent 
        load_mailbox('sent')
        console.log('success:',data);
      });
    console.log(data);
    return false;
    

  }
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  history.pushState({}, '', '/emails');

  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-load').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails.length);
      //Itterating over each email
      for(let i=0;i<emails.length;i++){
        
        const post = document.createElement('div');
        post.className = 'post';
        post.innerHTML = `<span class='sender'><b>${emails[i].sender}</b></span>
        <span class='sub'>  ${"  " + emails[i].subject}</span>
        <span class='time'>${emails[i].timestamp}</span>`;
        post.addEventListener('click', () => emails_load(emails[i].id));
        document.querySelector('#emails-view').appendChild(post);
        if(mailbox!=='sent'){
          const btton = document.createElement('button');
          btton.setAttribute("class", "btn btn-sm btn-outline-primary");
          btton.textContent = emails[i].archived ? "Unarchive" : "Archive";
          document.querySelector('#emails-view').appendChild(btton);
          //Adding Archive button
          btton.addEventListener('click', () => {
            fetch(`/emails/${emails[i].id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: !emails[i].archived
              })
            })
              .then(() => load_mailbox(mailbox));
          })
        }
        
      }
      //Changing color of read email
      const lis=document.getElementsByClassName("post");
      for(let i=0;i<lis.length;i++){
        if(emails[i].read){
          lis[i].style.background ="lightgrey";
        }
      }

      // ... do something else with emails ...
    });
    
  history.pushState({}, '', `/emails/${mailbox}`);
};

function emails_load(id){
  document.querySelector('#email-load').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Loading the email
      const post = document.querySelector(".mail");
      //post.className = 'mail';
      post.innerHTML = `<b><p>From: ${email.sender}</p>
        <p>To: ${email.recipients}</p>
        <p>Subject:  ${ email.subject}</p>
        <p>TimeStamp: ${email.timestamp}</p></b>
        <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
        <div class="email-body"> ${email.body}</div>`;
        //making a Reply button
        document.querySelector("#reply").addEventListener('click',()=> {
          compose_email();
          document.querySelector('#compose-recipients').value = email.sender;
          document.querySelector('#compose-subject').value = email.subject.slice(0,4)=="Re: "? email.subject.slice(4,): 'Re: '+email.subject;
          document.querySelector('#compose-body').value = 'On '+email.timestamp+' '+email.sender+" Wrote "+email.body ;
        });
      
      // Marking the email as read
    });
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    }) 
  });

  history.pushState({}, '', `/emails/${id}`);
};