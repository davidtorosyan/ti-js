var program = `1->X
1->B
For(Y,1,2,1)
Lbl A
X+1->X
End
If B=1
Then
2->B
Goto A
End
Disp X`;

lines = tipiler.parse(program)

console.log(lines)
arr = eval(lines)

let debug = false;
tilib.core.run(arr, { debug: debug })