
fun test2() {
    return -10;
}


fun test() {
    var x = 10;
    var y = 100;
    
    return x,y, test2(), x + y;
}


print test();


var x = 10;

var y = [x, 11, 12];

x = 100;

print y;