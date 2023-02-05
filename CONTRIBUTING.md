# TI-JS dev guide

## Development

To build, use node.

```sh
npm install
npm run build # production build
npm start # dev build, experiment at localhost:9080/playground/
```

## Architecture

### ASCII

## Command progress

Below is a table of which commands have been implemented so far.

**Legend**

| Symbol          | Meaning                   |
| ----------------- | ------------------------- |
| ✅ Complete     | No more to do!            |
| ⚠ Partial       | In place, but not fully.  |
| ⏱ Planned      | Not started, but planned. |
| ⛔ Out of scope | No plans to implement. Usually this is because it's not useful for programming. |

Columns:
* Grammar: whether or not the command is captured by the [grammar](src/parse/tibasic.peggy).
* Behavior: whether or not the command is handled properly in [evaluate](src/evaluate).

### Keyboard

#### Tokens

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Ans`          | ✅ Complete     | ✅ Complete     |       |
| `&theta`       | ✅ Complete     | ✅ Complete     |       |
| `->`           | ✅ Complete     | ✅ Complete     |       |

#### Constants

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `&i`           | ⏱ Planned      | ⏱ Planned       |       |
| `&pi`          | ⏱ Planned      | ⏱ Planned       |       |
| `&e`           | ⏱ Planned      | ⏱ Planned       |       |

#### Operators

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `+`            | ✅ Complete     | ✅ Complete     |       |
| `-`            | ✅ Complete     | ✅ Complete     |       |
| `&-`           | ✅ Complete     | ✅ Complete     | unary negative |
| `*`            | ✅ Complete     | ✅ Complete     |       |
| `/`            | ✅ Complete     | ✅ Complete     |       |
| `^`            | ⏱ Planned      | ⏱ Planned       |       |
| `^-1`          | ⏱ Planned      | ⏱ Planned       |       |
| `&E`           | ✅ Complete     | ✅ Complete     | scientific notation |
| `()`           | ✅ Complete     | ✅ Complete     |       |
| `&root(`       | ⏱ Planned      | ⏱ Planned       |       |
| `&10^(`        | ⏱ Planned      | ⏱ Planned       |       |
| `&e^(`         | ⏱ Planned      | ⏱ Planned       |       |
| `log(`         | ⏱ Planned      | ⏱ Planned       |       |
| `ln(`          | ⏱ Planned      | ⏱ Planned       |       |

#### Trig

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `sin(`         | ⏱ Planned      | ⏱ Planned       |       |
| `cos(`         | ⏱ Planned      | ⏱ Planned       |       |
| `tan(`         | ⏱ Planned      | ⏱ Planned       |       |
| `sin-1(`       | ⏱ Planned      | ⏱ Planned       |       |
| `cos-1(`       | ⏱ Planned      | ⏱ Planned       |       |
| `tan-1(`       | ⏱ Planned      | ⏱ Planned       |       |

### Test

#### Test

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `=`            | ✅ Complete     | ✅ Complete     |       |
| `!=`           | ✅ Complete     | ✅ Complete     |       |
| `>`            | ✅ Complete     | ✅ Complete     |       |
| `>=`           | ✅ Complete     | ✅ Complete     |       |
| `<`            | ✅ Complete     | ✅ Complete     |       |
| `<=`           | ✅ Complete     | ✅ Complete     |       |

#### Logic

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `and`          | ✅ Complete     | ✅ Complete     |       |
| `or`           | ✅ Complete     | ✅ Complete     |       |
| `xor`          | ✅ Complete     | ✅ Complete     |       |
| `not(`         | ⏱ Planned      | ⏱ Planned      |       |

### PRGM

#### CTL   

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `If`           | ✅ Complete     | ✅ Complete     |       |
| `Then`         | ✅ Complete     | ✅ Complete     |       |
| `Else`         | ✅ Complete     | ✅ Complete     |       |
| `For(`         | ⚠ Partial       | ⚠ Partial       | should accept expressions |
| `While`        | ✅ Complete     | ✅ Complete     |       |
| `Repeat`       | ✅ Complete     | ✅ Complete     |       |
| `End`          | ✅ Complete     | ✅ Complete     |       |
| `Pause`        | ✅ Complete     | ✅ Complete     |       |
| `Lbl`          | ✅ Complete     | ✅ Complete     |       |
| `Goto`         | ✅ Complete     | ✅ Complete     |       |
| `IS>(`         | ✅ Complete     | ✅ Complete     |       |
| `DS<(`         | ✅ Complete     | ✅ Complete     |       |
| `Menu(`        | ✅ Complete     | ✅ Complete     |       |
| `prgm`         | ✅ Complete     | ⏱ Planned      |       |
| `Return`       | ✅ Complete     | ⚠ Partial       | should handle subprograms |
| `Stop`         | ✅ Complete     | ✅ Complete     |       |
| `DelVar`       | ⚠ Partial       | ✅ Complete     | should be able to appear multiple times in a line |
| `GraphStyle(`  | ✅ Complete     | ⏱ Planned      |       |
| `OpenLib(`     | ✅ Complete     | ⛔ Out of scope |       |
| `ExecLib(`     | ✅ Complete     | ⛔ Out of scope |       |

#### I/O

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Input`        | ✅ Complete     | ✅ Complete     |       |
| `Prompt`       | ⚠ Partial       | ⚠ Partial       | should allow multiple variables |
| `Disp`         | ✅ Complete     | ✅ Complete     |       |
| `DispGraph`    | ✅ Complete     | ⏱ Planned      |       |
| `DispTable`    | ✅ Complete     | ⏱ Planned      |       |
| `Output(`      | ✅ Complete     | ⚠ Partial       | should respect rows/cols |
| `getKey`       | ✅ Complete     | ⏱ Planned      |       |
| `ClrHome`      | ✅ Complete     | ⏱ Planned      |       |
| `ClrTable`     | ✅ Complete     | ⏱ Planned      |       |
| `GetCalc(`     | ✅ Complete     | ⏱ Planned      |       |
| `Get(`         | ✅ Complete     | ⏱ Planned      |       |
| `Send(`        | ✅ Complete     | ⏱ Planned      |       |

### Lists

#### OPS

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `SortA(`       | ⏱ Planned      | ⏱ Planned      |       |
| `SortD(`       | ⏱ Planned      | ⏱ Planned      |       |
| `dim(`         | ⏱ Planned      | ⏱ Planned      |       |
| `Fill(`        | ⏱ Planned      | ⏱ Planned      |       |
| `seq(`         | ⏱ Planned      | ⏱ Planned      |       |
| `cumSum(`      | ⏱ Planned      | ⏱ Planned      |       |
| `dList(`       | ⏱ Planned      | ⏱ Planned      |       |
| `Select(`      | ⏱ Planned      | ⏱ Planned      |       |
| `augment(`     | ⏱ Planned      | ⏱ Planned      |       |
| `List>matr(`   | ⏱ Planned      | ⏱ Planned      |       |
| `Matr>list(`   | ⏱ Planned      | ⏱ Planned      |       |
| `&list`        | ✅ Complete    | ✅ Complete     | named lists |

### Stats

#### Edit

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `ClrList`      | ⏱ Planned      | ⏱ Planned      |       |
| `SetUpEditor`  | ⏱ Planned      | ⏱ Planned      |       |

#### Calc

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `1-Var Stats`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-Var Stats`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `Med-Med`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `LinReg(ax+b)` | ⛔ Out of scope | ⛔ Out of scope |       |
| `QuadReg`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `CubicReg`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `QuartReg`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `LinReg(a+bx)` | ⛔ Out of scope | ⛔ Out of scope |       |
| `LnReg`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `ExpReg`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `PwrReg`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Logistic`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `SinReg`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Manual-Fit`   | ⛔ Out of scope | ⛔ Out of scope |       |

#### Tests

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Z-Test(`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `T-Test`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-SampZTest(` | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-SampTTest`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `1-PropZTest(` | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-PropZTest(` | ⛔ Out of scope | ⛔ Out of scope |       |
| `ZInterval`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `TInterval`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-SampZInt(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-SampTInt`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `1-PropZInt(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-PropZInt(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `X2-Test(`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `X2GOF-Test(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-SampFTest`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `LinRegTTest`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `LinRegTInt`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `ANOVA(`       | ⛔ Out of scope | ⛔ Out of scope |       |

#### Math

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `min(`         | ⏱ Planned      | ⏱ Planned      |       |
| `max(`         | ⏱ Planned      | ⏱ Planned      |       |
| `mean(`        | ⏱ Planned      | ⏱ Planned      |       |
| `median(`      | ⏱ Planned      | ⏱ Planned      |       |
| `sum(`         | ⏱ Planned      | ⏱ Planned      |       |
| `prod(`        | ⏱ Planned      | ⏱ Planned      |       |
| `stdDev(`      | ⏱ Planned      | ⏱ Planned      |       |
| `variance(`    | ⏱ Planned      | ⏱ Planned      |       |

### Math

#### Math

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `>Frac`        | ⏱ Planned      | ⏱ Planned      |       |     
| `>Dec`         | ⏱ Planned      | ⏱ Planned      |       |    
| `^3`           | ⏱ Planned      | ⏱ Planned      |       |  
| `&3root(`      | ⏱ Planned      | ⏱ Planned      |       |       
| `&Nroot(`      | ⏱ Planned      | ⏱ Planned      |       |       
| `fMin(`        | ⏱ Planned      | ⏱ Planned      |       |     
| `fMax(`        | ⏱ Planned      | ⏱ Planned      |       |     
| `nDeriv(`      | ⏱ Planned      | ⏱ Planned      |       |       
| `fnInt(`       | ⏱ Planned      | ⏱ Planned      |       |      
| `solve(`       | ⏱ Planned      | ⏱ Planned      |       |

#### Num

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `abs(`         | ⏱ Planned      | ⏱ Planned      |       |
| `round(`       | ⏱ Planned      | ⏱ Planned      |       |
| `iPart(`       | ⏱ Planned      | ⏱ Planned      |       |
| `fPart(`       | ⏱ Planned      | ⏱ Planned      |       |
| `int(`         | ⏱ Planned      | ⏱ Planned      |       |
| `min(`         | ⏱ Planned      | ⏱ Planned      |       |
| `max(`         | ⏱ Planned      | ⏱ Planned      |       |
| `lcm(`         | ⏱ Planned      | ⏱ Planned      |       |
| `gcd(`         | ⏱ Planned      | ⏱ Planned      |       |

#### Cpx

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `conj(`        | ⏱ Planned      | ⏱ Planned      |       |
| `real(`        | ⏱ Planned      | ⏱ Planned      |       |
| `imag(`        | ⏱ Planned      | ⏱ Planned      |       |
| `angle(`       | ⏱ Planned      | ⏱ Planned      |       |
| `abs(`         | ⏱ Planned      | ⏱ Planned      |       |
| `>Rect(`       | ⏱ Planned      | ⏱ Planned      |       |
| `>Polar(`      | ⏱ Planned      | ⏱ Planned      |       |

#### Prb

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `rand`         | ⏱ Planned      | ⏱ Planned      |       |
| `nPr`          | ⏱ Planned      | ⏱ Planned      |       |
| `nCr`          | ⏱ Planned      | ⏱ Planned      |       |
| `!`            | ⏱ Planned      | ⏱ Planned      |       |
| `randInt(`     | ⏱ Planned      | ⏱ Planned      |       |
| `randNorm(`    | ⏱ Planned      | ⏱ Planned      |       |
| `randBin(`     | ⏱ Planned      | ⏱ Planned      |       |

### Angle

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `&deg`         | ⏱ Planned      | ⏱ Planned      |       |
| `'`            | ⏱ Planned      | ⏱ Planned      |       |
| `&r`           | ⏱ Planned      | ⏱ Planned      |       |
| `>DMS`         | ⏱ Planned      | ⏱ Planned      |       |
| `R>Pr(`        | ⏱ Planned      | ⏱ Planned      |       |
| `R>Ptheta(`    | ⏱ Planned      | ⏱ Planned      |       |
| `P>Rx(`        | ⏱ Planned      | ⏱ Planned      |       |
| `P>Ry(`        | ⏱ Planned      | ⏱ Planned      |       |

### Draw

#### Draw

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `ClrDraw`      | ⏱ Planned      | ⏱ Planned      |       |
| `Line(`        | ⏱ Planned      | ⏱ Planned      |       |
| `Horizontal`   | ⏱ Planned      | ⏱ Planned      |       |
| `Veritcal`     | ⏱ Planned      | ⏱ Planned      |       |
| `Tangent(`     | ⏱ Planned      | ⏱ Planned      |       |
| `DrawF`        | ⏱ Planned      | ⏱ Planned      |       |
| `Shade(`       | ⏱ Planned      | ⏱ Planned      |       |
| `DrawInv`      | ⏱ Planned      | ⏱ Planned      |       |
| `Circle(`      | ⏱ Planned      | ⏱ Planned      |       |
| `Text(`        | ⏱ Planned      | ⏱ Planned      |       |

#### Points

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Pt-On(`       | ⏱ Planned      | ⏱ Planned      |       |
| `Pt-Off(`      | ⏱ Planned      | ⏱ Planned      |       |
| `Pt-Change(`   | ⏱ Planned      | ⏱ Planned      |       |
| `pxl-On(`      | ⏱ Planned      | ⏱ Planned      |       |
| `pxl-Off(`     | ⏱ Planned      | ⏱ Planned      |       |
| `pxl-Change(`  | ⏱ Planned      | ⏱ Planned      |       |
| `pxl-Test(`    | ⏱ Planned      | ⏱ Planned      |       |


### STO

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `StorePic`     | ⏱ Planned      | ⏱ Planned      |       |
| `RecallPic`    | ⏱ Planned      | ⏱ Planned      |       |
| `StoreGDB`     | ⏱ Planned      | ⏱ Planned      |       |
| `RecallGDB`    | ⏱ Planned      | ⏱ Planned      |       |

### Vars

#### Numbered

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Str`          | ✅ Complete     | ✅ Complete     |       |
| `&L`           | ✅ Complete     | ✅ Complete     | lists |
| `[A]`          | ⏱ Planned      | ⏱ Planned      | matrix (letters A-J) |
| `GDB`          | ⏱ Planned      | ⏱ Planned      |       |
| `&Y`           | ⏱ Planned      | ⏱ Planned      |       |
| `&XT`          | ⏱ Planned      | ⏱ Planned      |       |
| `&YT`          | ⏱ Planned      | ⏱ Planned      |       |
| `&r`           | ⏱ Planned      | ⏱ Planned      |       |

#### Y-Vars

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `FnOn`         | ⏱ Planned      | ⏱ Planned      |       |
| `FnOff`        | ⏱ Planned      | ⏱ Planned      |       |

#### Window

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Xmin`         | ⏱ Planned      | ⏱ Planned      |       |
| `Xmax`         | ⏱ Planned      | ⏱ Planned      |       |
| `Xscl`         | ⏱ Planned      | ⏱ Planned      |       |
| `Ymin`         | ⏱ Planned      | ⏱ Planned      |       |
| `Ymax`         | ⏱ Planned      | ⏱ Planned      |       |
| `Yscl`         | ⏱ Planned      | ⏱ Planned      |       |
| `Xres`         | ⏱ Planned      | ⏱ Planned      |       |
| `&deltaX`      | ⏱ Planned      | ⏱ Planned      |       |
| `&deltaY`      | ⏱ Planned      | ⏱ Planned      |       |
| `XFact`        | ⏱ Planned      | ⏱ Planned      |       |
| `YFact`        | ⏱ Planned      | ⏱ Planned      |       |
| `Tmin`         | ⏱ Planned      | ⏱ Planned      |       |
| `Tmax`         | ⏱ Planned      | ⏱ Planned      |       |
| `Tstep`        | ⏱ Planned      | ⏱ Planned      |       |
| `&thetamin`    | ⏱ Planned      | ⏱ Planned      |       |
| `&thetamax`    | ⏱ Planned      | ⏱ Planned      |       |
| `&thetastep`   | ⏱ Planned      | ⏱ Planned      |       |
| `u(nMin)`      | ⏱ Planned      | ⏱ Planned      |       |
| `v(nMin)`      | ⏱ Planned      | ⏱ Planned      |       |
| `w(nMin)`      | ⏱ Planned      | ⏱ Planned      |       |
| `nMin`         | ⏱ Planned      | ⏱ Planned      |       |
| `nMax`         | ⏱ Planned      | ⏱ Planned      |       |
| `PlotStart`    | ⏱ Planned      | ⏱ Planned      |       |
| `PlotStep`     | ⏱ Planned      | ⏱ Planned      |       |


#### Zoom

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `ZXmin`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZXmax`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZXscl`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZYmin`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZYmax`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZYscl`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZXres`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZTmin`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZTmax`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZTstep`       | ⏱ Planned      | ⏱ Planned      |       |
| `Z&thetamin`   | ⏱ Planned      | ⏱ Planned      |       |
| `Z&thetamax`   | ⏱ Planned      | ⏱ Planned      |       |
| `Z&thetastep`  | ⏱ Planned      | ⏱ Planned      |       |
| `Zu(nMin)`     | ⏱ Planned      | ⏱ Planned      |       |
| `Zv(nMin)`     | ⏱ Planned      | ⏱ Planned      |       |
| `Zw(nMin)`     | ⏱ Planned      | ⏱ Planned      |       |
| `ZnMin`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZnMax`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZPlotStart`   | ⏱ Planned      | ⏱ Planned      |       |
| `ZPlotStep`    | ⏱ Planned      | ⏱ Planned      |       |

#### Statistics

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Stat vars`    | ⛔ Out of scope | ⛔ Out of scope | too many to list |

#### Table

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `TblStart`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `&deltaTbl`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `TblInput`     | ⛔ Out of scope | ⛔ Out of scope |       |

### Distr

#### Distr

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `normalpdf(`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `normalcdf(`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `invNorm(`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `invT(`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `tpdf(`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `tcdf(`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `x2pdf(`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `x2cdf(`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Fpdf(`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `Fcdf(`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `binompdf(`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `binomcdf(`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `poissonpdf(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `poissoncdf(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `geometpdf(`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `geometcdf(`   | ⛔ Out of scope | ⛔ Out of scope |       |

#### Draw

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `ShadeNorm(`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `Shade_t(`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `ShadeX2(`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `ShadeF(`      | ⛔ Out of scope | ⛔ Out of scope |       |

### Stat Plot

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Plot1(`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Plot2(`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Plot3(`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `PlotsOff`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `PlotsOn`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `Scatter`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `xyLine`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Histogram`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `ModBoxplot`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `Boxplot`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `NormProbPlot` | ⛔ Out of scope | ⛔ Out of scope |       |
| `&box`         | ⏱ Planned      | ⏱ Planned      |       |
| `&cross`       | ⏱ Planned      | ⏱ Planned      |       |
| `&dot`         | ⏱ Planned      | ⏱ Planned      |       |

### Table Setup

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `IndpntAuto`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `IndpntAsk`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `DependAuto`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `DependAsk`    | ⛔ Out of scope | ⛔ Out of scope |       |

### Format

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `RectGC`       | ⏱ Planned      | ⏱ Planned      |       |
| `PolarGC`      | ⏱ Planned      | ⏱ Planned      |       |
| `CoordOn`      | ⏱ Planned      | ⏱ Planned      |       |
| `CoordOff`     | ⏱ Planned      | ⏱ Planned      |       |
| `GridOff`      | ⏱ Planned      | ⏱ Planned      |       |
| `GridOn`       | ⏱ Planned      | ⏱ Planned      |       |
| `AxesOn`       | ⏱ Planned      | ⏱ Planned      |       |
| `AxesOff`      | ⏱ Planned      | ⏱ Planned      |       |
| `LabelOff`     | ⏱ Planned      | ⏱ Planned      |       |
| `LabelOn`      | ⏱ Planned      | ⏱ Planned      |       |
| `ExprOn`       | ⏱ Planned      | ⏱ Planned      |       |
| `ExprOff`      | ⏱ Planned      | ⏱ Planned      |       |

### Zoom

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `ZBox`         | ⏱ Planned      | ⏱ Planned      |       |
| `Zoom In`      | ⏱ Planned      | ⏱ Planned      |       |
| `Zoom Out`     | ⏱ Planned      | ⏱ Planned      |       |
| `ZDecimal`     | ⏱ Planned      | ⏱ Planned      |       |
| `ZSquare`      | ⏱ Planned      | ⏱ Planned      |       |
| `ZStandard`    | ⏱ Planned      | ⏱ Planned      |       |
| `ZTrig`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZInteger`     | ⏱ Planned      | ⏱ Planned      |       |
| `ZoomStat`     | ⏱ Planned      | ⏱ Planned      |       |
| `ZoomFit`      | ⏱ Planned      | ⏱ Planned      |       |
| `ZPrevious`    | ⏱ Planned      | ⏱ Planned      |       |
| `ZoomSto`      | ⏱ Planned      | ⏱ Planned      |       |
| `ZoomRcl`      | ⏱ Planned      | ⏱ Planned      |       |

### Matrix

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `det(`         | ⏱ Planned      | ⏱ Planned      |       |
| `&T`           | ⏱ Planned      | ⏱ Planned      |       |
| `dim(`         | ⏱ Planned      | ⏱ Planned      |       |
| `Fill(`        | ⏱ Planned      | ⏱ Planned      |       |
| `identity(`    | ⏱ Planned      | ⏱ Planned      |       |
| `randM(`       | ⏱ Planned      | ⏱ Planned      |       |
| `augment(`     | ⏱ Planned      | ⏱ Planned      |       |
| `Matr>list(`   | ⏱ Planned      | ⏱ Planned      |       |
| `List>matr(`   | ⏱ Planned      | ⏱ Planned      |       |
| `cumSum(`      | ⏱ Planned      | ⏱ Planned      |       |
| `ref(`         | ⏱ Planned      | ⏱ Planned      |       |
| `rref(`        | ⏱ Planned      | ⏱ Planned      |       |
| `rowSwap(`     | ⏱ Planned      | ⏱ Planned      |       |
| `row+(`        | ⏱ Planned      | ⏱ Planned      |       |
| `*row(`        | ⏱ Planned      | ⏱ Planned      |       |
| `*row+(`       | ⏱ Planned      | ⏱ Planned      |       |