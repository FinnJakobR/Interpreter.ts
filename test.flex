fun thrice(fn) {
  for (var i = 1; i <= 3; i = i + 1) {
    fn(i);
  }
}

thrice(
  fun (a) {
  
  switch (a) :
    case 1 : {
        print "a One";
        break;
    }

    case 2 : {
      print "a Two";
      break;
    }

});
