```
npm run start
```

1)- check authentication state in store
2)- if not logged in do nothing if logged in do nothing if logging in then continue process wherever left
3)- ui will up and ask for authentication state 
4)- user logged --> token --> validateToken --> if valid then enter entry as logging in 
5)- Get data from server about the font names and add their state as installing 
6)- Download the zipped fonts file in any folder 
7)- Install them using fontIO 
8)- Save assets status in file 
9)- UI will ask or inform 


FOntIO send data back to hls grpc server 
So this needs to be started on same port as hls 

