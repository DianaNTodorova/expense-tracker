from flask import Flask, request, Response, render_template
import io
import json

app = Flask(__name__)



@app.route("/")
def home():
    return render_template("index.html")


@app.route('/download-expenses', methods=['POST'])
def download_expenses():
    data = request.get_json()
    expenses = data.get("expenses", [])

    if not expenses:
        return Response("No expenses found!", status=400)

    # Create an in-memory text file
    output = io.StringIO()

    # Write headers
    output.write("Expense Category | Amount | Date\n")
    output.write("-" * 40 + "\n")

    # Write expense data
    for expense in expenses:
        output.write(f"{expense['category']} | ${expense['amount']} | {expense['date']}\n")

    # Move to the beginning of the file
    output.seek(0)

    # Return as TXT file response
    return Response(
        output.getvalue(),
        mimetype="text/plain",
        headers={"Content-Disposition": "attachment; filename=All_Expenses.txt"}
    )

if __name__ == "__main__":
    app.run(debug=True)
