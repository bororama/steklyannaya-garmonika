import app from './app'

app.listen(8080, () => {
    console.log('server listening on 8080...');
    console.log(`host ${process.env.HOST_ADDRESS}`)
}) 