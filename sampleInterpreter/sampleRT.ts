abstract class LiteralValue{
    abstract ToString() : string;
    abstract EvalBool() : boolean;
    abstract EvalNumeric() : number;
    abstract EvalString() : string;
}

class NumericValue extends LiteralValue{
    value : number

    ToString(): string{
        return this.value.toString();
    }

    constructor(value_in : number){
        super();
        this.value = value_in;
    }

    EvalBool() : boolean{
        console.log("RuntimeError002-CannotEvaluateNumericExpressionToBool");
        process.abort();
        return false;
    }

    EvalNumeric() : number{
        return this.value;
    }

    EvalString() : string{
        console.log("RuntimeError003-CannotEvaluateNumericExpressionToString");
        process.abort();
        return "deadbeef";
    }
}

class StringValue extends LiteralValue{
    value : string

    ToString(): string{
        return this.value;
    }

    EvalBool() : boolean{
        console.log("RuntimeError004-CannotEvaluateStringExpressionToBool");
        process.abort();
        return false;
    }

    EvalNumeric() : number{
        console.log("RuntimeError005-CannotEvaluateStringExpressionToNumeric");
        process.abort();
        return 5;
    }

    EvalString() : string{
        return this.value;
    }

    constructor(value_in : string){
        super();
        this.value = value_in;
    }
}

class BoolValue extends LiteralValue{
    value : boolean

    ToString(): string{
        return this.value.toString();
    }

    EvalBool() : boolean{
        return this.value;
    }

    EvalNumeric() : number{
        console.log("RuntimeError007-CannotEvaluateBoolExpressionToNumeric");
        process.abort();
        return 5;
    }

    EvalString() : string{
        console.log("RuntimeError008-CannotEvaluateBoolExpressionToString");
        process.abort();
        return "deadbeef";
    }

    constructor(value_in : boolean){
        super();
        this.value = value_in;
    }
}

abstract class Expr{
    abstract EvalBool() : boolean;
    abstract EvalNumeric() : number;
    abstract EvalString() : string;
}

class LiteralExpression extends Expr{
    value : LiteralValue;

    EvalBool() : boolean{
        return this.value.EvalBool();
    }

    EvalNumeric() : number{
        return this.value.EvalNumeric();
    }

    EvalString() : string{
        return this.value.EvalString();
    }

    constructor(value_in : LiteralValue){
        super();
        this.value = value_in;
    }
}

enum Operation { Plus, Minus, Times, Div, Mod, CheckEqu, LT, LTE, GT, GTE}

class BinarayExpression extends Expr{
    lhs : Expr;
    rhs : Expr;
    operation : Operation;

    EvalBool() : boolean{
        switch(this.operation){
            case Operation.Plus:
            case Operation.Minus:
            case Operation.Times:
            case Operation.Div:
            case Operation.Mod:
            {
                console.log("RuntimeError009-CannotEvaluateBinaryExpressionUsingNumericOp");
                process.abort();
                return false;
            }
            case Operation.CheckEqu:
            {
                return this.lhs.EvalNumeric() === this.rhs.EvalNumeric();
            }
            case Operation.LT:
            {
                return this.lhs.EvalNumeric() < this.rhs.EvalNumeric();
            }
            case Operation.LTE:
            {
                return this.lhs.EvalNumeric() <= this.rhs.EvalNumeric();
            }
            case Operation.GT:
            {
                return this.lhs.EvalNumeric() > this.rhs.EvalNumeric();
            }
            case Operation.GTE:
            {
                return this.lhs.EvalNumeric() >= this.rhs.EvalNumeric();
            }
        }
    }

    EvalNumeric() : number{
        console.log("RuntimeErrorTmp-NotImplemented");
        process.abort();
        return 6;
    }

    EvalString() : string{
        console.log("RuntimeErrorTmp-NotImplemented");
        process.abort();
        return "deadbeef";
    }

    constructor(lhs_in : Expr, rhs_in : Expr, op_in : Operation){
        super();
        this.lhs = lhs_in;
        this.rhs = rhs_in;
        this.operation = op_in;
    }
}

abstract class AstNode{
    abstract exec() : void;
}

class TerminalNode extends AstNode{
    exec(): void{
        
    }

    constructor(){
        super();
    }
}

class DispNode extends AstNode{
    private val: LiteralValue;
    private child: AstNode;

    constructor(val_in: LiteralValue, child_in: AstNode){
        super();
        this.val = val_in;
        this.child = child_in;
    }

    exec(): void{
        console.log(this.val.ToString());
        this.child.exec();
    }
}

class ConditionalNode extends AstNode{
    private cond : Expr;
    private trueRes : AstNode;
    private falseRes : AstNode;

    constructor(cond_in: Expr, true_in : AstNode, false_in : AstNode)
    {
        super();
        this.cond = cond_in;
        this.trueRes = true_in;
        this.falseRes = false_in;
    }

    exec(): void{
        if (this.cond.EvalBool())
        {
            this.trueRes.exec();
        }
        else
        {
            this.falseRes.exec();
        }
    }
}

let T = new TerminalNode();
let TRUE = new DispNode(new NumericValue(5), T);
let FALSE = new DispNode(new NumericValue(6), T);
let root = new ConditionalNode(
    new BinarayExpression(
        new LiteralExpression(new NumericValue(5)),
        new LiteralExpression(new NumericValue(6)),
        Operation.LT),
    TRUE,
    FALSE);

root.exec();