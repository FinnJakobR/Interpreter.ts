fun thrice(fn) {
  for (var i = 1; i <= 3; i = i + 1) {
    fn(i);
  }
}

fun x (a) {
  print a;
}

thrice(x);