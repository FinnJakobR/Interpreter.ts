var a = 0;
var temp = 0;

var z;

for (var b = 1; a < 10000; b = temp + b) {
  print a;
  temp = a;
  a = b; 
}