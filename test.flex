fun sayHi() {
  var x = 10;

  while(x < 100) {

    if(x == 50) {
      break;
    }

    x+=1;
  }

  return x;
}

print sayHi();